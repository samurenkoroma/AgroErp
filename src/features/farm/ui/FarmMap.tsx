// src/features/farm/ui/FarmMap.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { farmLib, Field, Greenhouse, Plot } from '@/entities';
import * as turf from "@turf/turf";
import {useFarmPage} from "@/features/farm/hooks";

interface FarmMapProps {
    onMapLoad?: (map: mapboxgl.Map) => void,
    objects: (Field | Greenhouse | Plot)[],
    onObjectClick?: (object: any) => void;
}

const FarmMap = ({ onMapLoad, objects, onObjectClick }: FarmMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const { farm, setSelectedObjectId } = useFarmPage();
    const [mapLoaded, setMapLoaded] = useState(false);
    // const [isMapReady, setIsMapReady] = useState(false);
    const objectsRef = useRef(objects);
    const layersAddedRef = useRef(false);

    // Обновляем ref при изменении объектов
    useEffect(() => {
        objectsRef.current = objects;
    }, [objects]);

    // Инициализация карты (только один раз)
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            console.error('Mapbox token is required. Add VITE_MAPBOX_TOKEN to .env');
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: farmLib.getLocation(farm),
            zoom: 12,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');
        map.current.addControl(new mapboxgl.ScaleControl(), 'top-left');

        map.current.on('load', () => {
            console.log('Map loaded');
            setMapLoaded(true);
            // setIsMapReady(true);
            if (onMapLoad && map.current) {
                onMapLoad(map.current);
            }
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                setMapLoaded(false);
                // setIsMapReady(false);
                layersAddedRef.current = false;
            }
        };
    }, [farm, onMapLoad]);

    // Функция для удаления всех источников и слоев, связанных с объектами
    const removeExistingSourcesAndLayers = useCallback(() => {
        if (!map.current || !map.current.getStyle()) return;

        console.log('Removing existing sources and layers...');

        // Список слоев, которые мы добавляем
        const layersToRemove = [
            'objects-fill',
            'objects-outline',
            'objects-points',
            'objects-fill-hover',
            'objects-outline-hover'
        ];

        // Удаляем слои
        layersToRemove.forEach(layerId => {
            if (map.current?.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
        });

        // Удаляем источник
        if (map.current?.getSource('objects-source')) {
            map.current.removeSource('objects-source');
        }

        // Очищаем флаг
        layersAddedRef.current = false;
    }, []);

    // Функция для добавления объектов на карту
    const addObjectsToMap = useCallback(() => {
        if (!map.current || !mapLoaded || !objectsRef.current.length) return;

        // Сначала удаляем старые слои и источники
        removeExistingSourcesAndLayers();

        console.log('Adding objects to map:', objectsRef.current.length);

        const features: any[] = [];

        objectsRef.current.forEach(obj => {
            if (!obj.geometry) return;

            // Для полигонов (поля, участки)
            if ((obj.geometry.type === 'Polygon' || obj.geometry.type === 'MultiPolygon') && obj.geometry.coordinates) {
                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        fillColor: getFillColor(obj),
                        fillOpacity: 0.4,
                        lineColor: getLineColor(obj),
                        lineWidth: 2,
                    },
                    geometry: obj.geometry,
                });
            }
            // Для точек (теплицы)
            else if (obj.geometry.type === 'Point' && obj.geometry.coordinates) {
                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        circleColor: getCircleColor(obj),
                        circleRadius: 8,
                    },
                    geometry: obj.geometry,
                });
            }
        });

        if (features.length === 0) return;

        const featureCollection = {
            type: 'FeatureCollection',
            features: features,
        };

        // Добавляем новый источник
        map.current.addSource('objects-source', {
            type: 'geojson',
            data: featureCollection,
        });

        // Определяем типы для полигонов и точек
        const polygonTypes = ['field', 'plot'];
        const polygonFeatures = features.filter(f => polygonTypes.includes(f.properties.type));
        const pointTypes = ['greenhouse'];
        const pointFeatures = features.filter(f => pointTypes.includes(f.properties.type));

        // Добавляем слои для полигонов
        if (polygonFeatures.length > 0) {
            // Заливка полигонов
            map.current.addLayer({
                id: 'objects-fill',
                type: 'fill',
                source: 'objects-source',
                filter: ['in', ['get', 'type'], ['literal', polygonTypes]],
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], '#fbbf24',
                        ['get', 'fillColor']
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 0.6,
                        0.4
                    ],
                },
            });

            // Обводка полигонов
            map.current.addLayer({
                id: 'objects-outline',
                type: 'line',
                source: 'objects-source',
                filter: ['in', ['get', 'type'], ['literal', polygonTypes]],
                paint: {
                    'line-color': ['get', 'lineColor'],
                    'line-width': ['get', 'lineWidth'],
                },
            });
        }

        // Добавляем слои для точек
        if (pointFeatures.length > 0) {
            map.current.addLayer({
                id: 'objects-points',
                type: 'circle',
                source: 'objects-source',
                filter: ['in', ['get', 'type'], ['literal', pointTypes]],
                paint: {
                    'circle-radius': ['get', 'circleRadius'],
                    'circle-color': ['get', 'circleColor'],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                },
            });
        }

        layersAddedRef.current = true;

        // Центрируем карту на всех объектах
        centerMapOnObjects(featureCollection);
    }, [mapLoaded, removeExistingSourcesAndLayers]);

    // Функция для получения цвета заливки
    const getFillColor = (obj: any) => {
        if (obj.type === 'field') return '#22c55e';
        if (obj.type === 'plot') return '#a855f7';
        return '#3b82f6';
    };

    // Функция для получения цвета линии
    const getLineColor = (obj: any) => {
        if (obj.type === 'field') return '#16a34a';
        if (obj.type === 'plot') return '#9333ea';
        return '#2563eb';
    };

    // Функция для получения цвета точки
    const getCircleColor = (obj: any) => {
        if (obj.type === 'greenhouse') return '#3b82f6';
        return '#6b7280';
    };

    // Функция для центрирования карты
    const centerMapOnObjects = (featureCollection: any) => {
        if (!map.current || !featureCollection.features.length) return;

        try {
            const bbox = turf.bbox(featureCollection);

            if (bbox[0] === Infinity || bbox[1] === Infinity ||
                bbox[2] === -Infinity || bbox[3] === -Infinity) {
                console.warn('Invalid bbox, cannot center');
                return;
            }

            map.current.fitBounds(
                [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] as [[number, number], [number, number]],
                {
                    padding: 50,
                    duration: 1000,
                    essential: true
                }
            );
        } catch (e) {
            console.error('Error centering on objects:', e);
        }
    };

    // Настройка обработчиков событий
    const setupEventHandlers = useCallback(() => {
        if (!map.current || !layersAddedRef.current) return;

        // Обработчик клика
        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            const features = map.current?.queryRenderedFeatures(e.point, {
                layers: ['objects-fill', 'objects-outline', 'objects-points'],
            });

            if (features && features.length > 0) {
                const feature = features[0];
                const properties = feature.properties;

                if (properties) {
                    const object = objectsRef.current.find(o => o.id === properties.id);
                    if (object) {
                        setSelectedObjectId(object.id);
                        if (onObjectClick) {
                            onObjectClick(object);
                        }
                    }
                }
            }
        };

        // Меняем курсор при наведении
        const handleMouseEnter = () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        };

        const handleMouseLeave = () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
        };

        map.current.on('click', handleClick);
        map.current.on('mouseenter', 'objects-fill', handleMouseEnter);
        map.current.on('mouseleave', 'objects-fill', handleMouseLeave);
        map.current.on('mouseenter', 'objects-points', handleMouseEnter);
        map.current.on('mouseleave', 'objects-points', handleMouseLeave);

        return () => {
            if (map.current) {
                map.current.off('click', handleClick);
                map.current.off('mouseenter', 'objects-fill', handleMouseEnter);
                map.current.off('mouseleave', 'objects-fill', handleMouseLeave);
                map.current.off('mouseenter', 'objects-points', handleMouseEnter);
                map.current.off('mouseleave', 'objects-points', handleMouseLeave);
            }
        };
    }, [setSelectedObjectId, onObjectClick]);

    // Добавляем объекты на карту при изменении списка объектов
    useEffect(() => {
        if (mapLoaded && map.current) {
            console.log('Objects changed, updating map...', objects.length);
            addObjectsToMap();
        }
    }, [mapLoaded, objects, addObjectsToMap]);

    // Настраиваем обработчики событий после добавления слоев
    useEffect(() => {
        if (mapLoaded && layersAddedRef.current) {
            const cleanup = setupEventHandlers();
            return cleanup;
        }
    }, [mapLoaded, setupEventHandlers]);

    return <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ background: '#1a1a2e' }} />;
};

export default FarmMap;