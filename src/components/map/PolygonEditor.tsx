import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface PolygonEditorProps {
    initialGeometry?: any;
    onGeometryChange?: (geometry: any) => void;
    onMapLoad?: (map: mapboxgl.Map) => void;
}

export const PolygonEditor = forwardRef<any, PolygonEditorProps>(({
                                                                      initialGeometry,
                                                                      onGeometryChange,
                                                                      onMapLoad
                                                                  }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const drawControl = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [currentGeometry, setCurrentGeometry] = useState<any>(initialGeometry);

    // Добавление существующего полигона на карту
    const addExistingPolygon = useCallback(() => {
        if (!map.current || !currentGeometry) return;

        const sourceId = 'existing-polygon';
        const fillLayerId = 'existing-polygon-fill';
        const outlineLayerId = 'existing-polygon-outline';

        try {
            if (map.current.getLayer(fillLayerId)) map.current.removeLayer(fillLayerId);
            if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
            if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

            map.current.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: currentGeometry,
                    properties: {},
                },
            });

            map.current.addLayer({
                id: fillLayerId,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': '#22c55e',
                    'fill-opacity': 0.3,
                },
            });

            map.current.addLayer({
                id: outlineLayerId,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': '#16a34a',
                    'line-width': 3,
                },
            });

            const coordinates = currentGeometry.coordinates[0];
            if (coordinates && coordinates.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(coord);
                });
                map.current.fitBounds(bounds, { padding: 50 });
            }
        } catch (error) {
            console.error('Error adding polygon:', error);
        }
    }, [currentGeometry]);

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            console.error('Mapbox token is required');
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [30.01618494185351, 45.90071961042261],
            zoom: 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            setIsReady(true);

            // Инициализируем Draw контрол в режиме редактирования
            drawControl.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    line_string: false,
                    point: true,
                    trash: true,
                },
                defaultMode: 'simple_select',
            });

            map.current!.addControl(drawControl.current, 'top-right');

            // Если есть начальная геометрия, загружаем её
            if (currentGeometry) {
                drawControl.current!.add({
                    type: 'Feature',
                    geometry: currentGeometry,
                    properties: {},
                });
                addExistingPolygon();
            }

            if (onMapLoad && map.current) {
                onMapLoad(map.current);
            }

            // Слушаем изменения полигона
            map.current!.on('draw.create', () => {
                const data = drawControl.current!.getAll();
                if (data.features.length > 0) {
                    console.log( data.features)
                    const newGeometry = data.features.pop().geometry;
                    setCurrentGeometry(newGeometry);
                    onGeometryChange?.(newGeometry);
                }
            });

            map.current!.on('draw.update', () => {
                const data = drawControl.current!.getAll();
                if (data.features.length > 0) {
                    const newGeometry = data.features[0].geometry;
                    setCurrentGeometry(newGeometry);
                    onGeometryChange?.(newGeometry);
                }
            });

            map.current!.on('draw.delete', () => {
                setCurrentGeometry(null);
                onGeometryChange?.(null);
            });
        });

        return () => {
            if (drawControl.current && map.current) {
                map.current.removeControl(drawControl.current);
            }
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Обновление при изменении initialGeometry извне
    useEffect(() => {
        if (initialGeometry && initialGeometry !== currentGeometry) {
            setCurrentGeometry(initialGeometry);
            if (drawControl.current && map.current?.isStyleLoaded()) {
                drawControl.current.deleteAll();
                drawControl.current.add({
                    type: 'Feature',
                    geometry: initialGeometry,
                    properties: {},
                });
                addExistingPolygon();
            }
        }
    }, [initialGeometry]);

    // Методы для доступа извне
    useImperativeHandle(ref, () => ({
        getMap: () => map.current,
        setGeometry: (geometry: any) => {
            setCurrentGeometry(geometry);
            if (drawControl.current && map.current?.isStyleLoaded()) {
                drawControl.current.deleteAll();
                if (geometry) {
                    drawControl.current.add({
                        type: 'Feature',
                        geometry: geometry,
                        properties: {},
                    });
                    addExistingPolygon();
                }
            }
        }
    }));

    return (
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-white">Загрузка карты...</div>
                </div>
            )}
            {isReady && (
                <div className="absolute top-4 left-4 z-10 bg-black/70 text-white text-xs p-2 rounded-lg">
                    <div>✏️ Режим редактирования</div>
                    <div className="text-gray-400 text-xs mt-1">Нажмите на полигон для редактирования</div>
                </div>
            )}
        </div>
    );
});

PolygonEditor.displayName = 'PolygonEditor';