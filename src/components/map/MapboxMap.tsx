import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { PhysicalObject } from '@/features/farm/types';

interface MapboxMapProps {
    objects: PhysicalObject[];
    selectedObject?: PhysicalObject | null;
    onObjectClick?: (object: PhysicalObject) => void;
    onMapLoad?: (map: mapboxgl.Map) => void;
    hoveredObjectId?: string | null;
    plannedObjectIds?: string[];
}

export function MapboxMap({
                              objects,
                              selectedObject,
                              onObjectClick,
                              onMapLoad,
                              hoveredObjectId,
                          }: MapboxMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const lastSelectedIdRef = useRef<string | null>(null);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const layersAddedRef = useRef(false);

    // Функция для центрирования карты на объекте
    const centerOnObject = useCallback((obj: PhysicalObject) => {
        if (!map.current || !mapLoaded) return;

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
            animationTimeoutRef.current = null;
        }

        try {
            let bounds: mapboxgl.LngLatBounds | null = null;

            if (obj.geometry.type === 'Polygon' && obj.geometry.coordinates[0]) {
                const coordinates = obj.geometry.coordinates[0] as [number, number][];

                coordinates.forEach(coord => {
                    if (!bounds) {
                        bounds = new mapboxgl.LngLatBounds([coord[0], coord[1]], [coord[0], coord[1]]);
                    } else {
                        bounds.extend([coord[0], coord[1]]);
                    }
                });

                const polygon = turf.polygon([coordinates]);
                const center = turf.center(polygon);
                const [centerLng, centerLat] = center.geometry.coordinates;

                if (bounds) {
                    const lngSpan = bounds.getEast() - bounds.getWest();
                    const latSpan = bounds.getNorth() - bounds.getSouth();

                    let zoom = 12;
                    if (lngSpan > 0.5 || latSpan > 0.5) {
                        zoom = 11;
                    } else if (lngSpan > 0.2 || latSpan > 0.2) {
                        zoom = 12;
                    } else if (lngSpan > 0.05 || latSpan > 0.05) {
                        zoom = 13;
                    } else {
                        zoom = 14;
                    }

                    map.current.flyTo({
                        center: [centerLng, centerLat],
                        zoom: zoom,
                        duration: 1000,
                        essential: true,
                    });
                } else {
                    map.current.flyTo({
                        center: [centerLng, centerLat],
                        zoom: 12,
                        duration: 1000,
                        essential: true,
                    });
                }
            } else if (obj.geometry.type === 'Point' && obj.geometry.coordinates) {
                const [lng, lat] = obj.geometry.coordinates as [number, number];

                map.current.flyTo({
                    center: [lng, lat],
                    zoom: 14,
                    duration: 1000,
                    essential: true,
                });
            } else if (obj.geometry.center) {
                map.current.flyTo({
                    center: [obj.geometry.center.x, obj.geometry.center.y],
                    zoom: 12,
                    duration: 1000,
                    essential: true,
                });
            }
        } catch (error) {
            console.error('Error centering on object:', error);
        }
    }, [mapLoaded]);

    // Центрируем карту при выборе объекта
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        if (selectedObject && selectedObject.id !== lastSelectedIdRef.current) {
            lastSelectedIdRef.current = selectedObject.id;
            setTimeout(() => {
                centerOnObject(selectedObject);
            }, 50);
        }
    }, [selectedObject, mapLoaded, centerOnObject]);

    // Инициализация карты
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
            style: 'mapbox://styles/mapbox/standard-satellite',
            center: [30.016184942, 45.90071961],
            zoom: 12,
            pitch: 0,
            bearing: 0,
            antialias: true,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');
        map.current.addControl(new mapboxgl.ScaleControl(), 'top-left');

        map.current.on('load', () => {
            setMapLoaded(true);
            if (onMapLoad && map.current) {
                onMapLoad(map.current);
            }
        });

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [onMapLoad]);

    // Функция обновления подсветки
    const updateHighlight = useCallback(() => {
        if (!map.current || !mapLoaded || !layersAddedRef.current) return;

        // Обновляем данные источника с выделенным объектом
        const features: any[] = [];

        objects.forEach(obj => {
            const isHovered = obj.id === hoveredObjectId;
            const isSelected = obj.id === selectedObject?.id;

            let fillColor = '#22c55e'; // зеленый по умолчанию
            let fillOpacity = 0.4;
            let lineColor = '#16a34a';
            let lineWidth = 2;

            if (obj.type === 'plot') {
                fillColor = '#a855f7';
                lineColor = '#9333ea';
            } else if (obj.type === 'warehouse') {
                fillColor = '#f59e0b';
                lineColor = '#d97706';
            }

            if (isHovered) {
                fillColor = '#fbbf24'; // желтый при hover
                fillOpacity = 0.8;
                lineColor = '#f59e0b';
                lineWidth = 4;
            } else if (isSelected) {
                fillOpacity = 0.7;
                lineWidth = 4;
            }

            if (obj.geometry.type === 'Polygon' && obj.geometry.coordinates[0]) {
                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        fillColor: fillColor,
                        fillOpacity: fillOpacity,
                        lineColor: lineColor,
                        lineWidth: lineWidth,
                        ...obj.attributes,
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: obj.geometry.coordinates,
                    },
                });
            } else if (obj.geometry.type === 'Point' && obj.geometry.coordinates) {
                let circleColor = '#3b82f6';
                let circleRadius = 8;

                if (obj.type === 'warehouse') {
                    circleColor = '#f59e0b';
                }

                if (isHovered) {
                    circleColor = '#fbbf24';
                    circleRadius = 14;
                } else if (isSelected) {
                    circleRadius = 12;
                }

                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        circleColor: circleColor,
                        circleRadius: circleRadius,
                        ...obj.attributes,
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: obj.geometry.coordinates,
                    },
                });
            }
        });

        // Обновляем источник данных
        const source = map.current.getSource('objects-source') as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: features,
            });
        }
    }, [objects, hoveredObjectId, selectedObject, mapLoaded]);

    // Добавление источников и слоев для объектов (один раз)
    useEffect(() => {
        if (!map.current || !mapLoaded || layersAddedRef.current) return;

        console.log('Adding layers...');

        // Подготовка данных для GeoJSON
        const features: any[] = [];

        objects.forEach(obj => {
            if (obj.geometry.type === 'Polygon' && obj.geometry.coordinates[0]) {
                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        fillColor: '#22c55e',
                        fillOpacity: 0.4,
                        lineColor: '#16a34a',
                        lineWidth: 2,
                        ...obj.attributes,
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: obj.geometry.coordinates,
                    },
                });
            } else if (obj.geometry.type === 'Point' && obj.geometry.coordinates) {
                features.push({
                    type: 'Feature',
                    id: obj.id,
                    properties: {
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        area: obj.area,
                        status: obj.status,
                        circleColor: '#3b82f6',
                        circleRadius: 8,
                        ...obj.attributes,
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: obj.geometry.coordinates,
                    },
                });
            }
        });

        // Добавляем источник данных
        map.current.addSource('objects-source', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features,
            },
        });

        // Стили для полигонов (поля, участки)
        const polygonTypes = ['field', 'plot', 'warehouse'];

        if (polygonTypes.length > 0) {
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
                        ['boolean', ['feature-state', 'planned'], false], '#f59e0b', // Оранжевый для запланированных
                        [
                            'match',
                            ['get', 'type'],
                            'field', '#22c55e',
                            'plot', '#a855f7',
                            'warehouse', '#f59e0b',
                            '#3b82f6'
                        ]
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 0.8,
                        ['boolean', ['feature-state', 'planned'], false], 0.6,
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

        // Стили для точек (теплицы, склады)
        const pointTypes = ['greenhouse', 'warehouse'];

        if (pointTypes.length > 0) {
            map.current.addLayer({
                id: 'objects-points',
                type: 'circle',
                source: 'objects-source',
                filter: ['in', ['get', 'type'], ['literal', pointTypes]],
                paint: {
                    'circle-radius': ['get', 'circleRadius'],
                    'circle-color': ['get', 'circleColor'],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                },
            });
        }

        // Обработчик клика
        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            const features = map.current?.queryRenderedFeatures(e.point, {
                layers: ['objects-fill', 'objects-outline', 'objects-points'],
            });

            if (features && features.length > 0) {
                const feature = features[0];
                const properties = feature.properties;

                if (properties) {
                    const object = objects.find(o => o.id === properties.id);
                    if (object) {
                        onObjectClick?.(object);
                    }
                }
            }
        };

        map.current.on('click', handleClick);

        // Меняем курсор при наведении на объекты
        map.current.on('mouseenter', 'objects-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'objects-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
        });
        map.current.on('mouseenter', 'objects-points', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'objects-points', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
        });

        layersAddedRef.current = true;
    }, [objects, mapLoaded, onObjectClick]);

    // Обновляем подсветку при изменении hoveredObjectId или selectedObject
    useEffect(() => {
        if (mapLoaded && layersAddedRef.current) {
            updateHighlight();
        }
    }, [hoveredObjectId, selectedObject, mapLoaded, updateHighlight]);

    return (
        <div
            ref={mapContainer}
            className="absolute inset-0 w-full h-full"
            style={{ background: '#1a1a2e' }}
        />
    );
}