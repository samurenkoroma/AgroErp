import {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {farmLib, Field, Greenhouse, Plot} from '@/entities';
import * as turf from "@turf/turf";
import {FeatureCollection} from 'geojson'
import {useFarmPage} from "@/features/farm/hooks";

interface FarmMapProps {
    onMapLoad?: (map: mapboxgl.Map) => void,
    objects: (Field | Greenhouse | Plot) [],
    onObjectClick?: (object: Field | Greenhouse | Plot) => void;
}

const FarmMap = ({onMapLoad, objects, onObjectClick}: FarmMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const {farm, setSelectedObjectId} = useFarmPage();

    //*
    const [mapLoaded, setMapLoaded] = useState(false);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const layersAddedRef = useRef(false);
    //*/
    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            console.error('Mapbox token is required. Add VITE_MAPBOX_TOKEN to .env');
            return;
        }
        let zoom = 12;
        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: farmLib.getLocation(farm),
            zoom: zoom,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');


        // TODO как сделаю карту проверить нужен ли этот обработчик
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
    }, [farm, onMapLoad]);

    // Добавление источников и слоев для объектов (один раз)
    useEffect(() => {
        if (!map.current || !mapLoaded || layersAddedRef.current) return;

        if (objects == null) {
            return;
        }

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
                        // ...obj.attributes,
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
                        circleRadius: 4,
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: obj.geometry.coordinates,
                    },
                });
            }
        });
        const featureCollection: FeatureCollection =  {
            type: 'FeatureCollection',
            features: features,
        }
        map.current.addSource('objects-source', {
            type: 'geojson',
            data: featureCollection,
        });
        // Стили для полигонов (поля, участки)
        const polygonTypes = ['field', 'plot'];

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
        const pointTypes = ['greenhouse'];

        if (pointTypes.length > 0) {
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
                        setSelectedObjectId(object.id);
                        // centerOnObject(object);
                        if (onObjectClick) {
                            onObjectClick(object)
                        }
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


        ////////////////////////////////////////

        // Вычисляем bounding box всей коллекции
        try {
            const bbox = turf.bbox(featureCollection);

            // Центрируем карту
            map.current.fitBounds(
                [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] as [[number, number], [number, number]],
                {
                    padding: 50,
                    duration: 1000,
                    essential: true
                }
            );
        } catch (e) {
            console.error('Error centering on all fields:', e);
        }
        ////////////////////////////////////////


    }, [mapLoaded, objects])

    return <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{background: '#1a1a2e'}}/>;
};

export default FarmMap;