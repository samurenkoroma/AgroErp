import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
    geometry?: any;
    center?: [number, number];
    zoom?: number;
    height?: string | number;
    interactive?: boolean;
    editable?: boolean;
    onGeometryChange?: (geometry: any) => void;
    onLoad?: (map: mapboxgl.Map) => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
                                                        geometry,
                                                        center = [37.618423, 55.751244],
                                                        zoom = 10,
                                                        height = '400px',
                                                        interactive = true,
                                                        editable = false,
                                                        onGeometryChange,
                                                        onLoad,
                                                    }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isGeometryLoaded, setIsGeometryLoaded] = useState(false);

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: center,
            zoom: zoom,
            interactive: interactive,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        if (editable) {
            draw.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    line_string: true,
                    point: true,
                    trash: true,
                    combine_features: true,
                    uncombine_features: true,
                },
                defaultMode: 'simple_select',
            });
            map.current.addControl(draw.current, 'top-left');
        }

        map.current.on('load', () => {
            setIsMapReady(true);
            onLoad?.(map.current!);
        });

        return () => {
            map.current?.remove();
        };
    }, []);

    // Загрузка существующей геометрии в Draw контрол
    useEffect(() => {
        if (!map.current || !isMapReady || !editable || !draw.current) return;
        if (isGeometryLoaded) return; // Предотвращаем повторную загрузку

        console.log('Загрузка геометрии в Draw контрол:', geometry);

        if (geometry) {
            try {
                // Нормализуем геометрию для Draw
                let geoJsonData: any;

                if (geometry.type === 'Feature' || geometry.type === 'FeatureCollection') {
                    geoJsonData = geometry;
                } else if (geometry.type && ['Point', 'LineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)) {
                    geoJsonData = {
                        type: 'Feature',
                        geometry: geometry,
                        properties: {},
                    };
                } else if (Array.isArray(geometry)) {
                    geoJsonData = {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: geometry,
                        },
                        properties: {},
                    };
                } else {
                    geoJsonData = geometry;
                }

                // Очищаем Draw
                draw.current.deleteAll();

                // Добавляем геометрию в Draw
                if (geoJsonData.type === 'FeatureCollection') {
                    geoJsonData.features.forEach((feature: any) => {
                        draw.current?.add(feature);
                    });
                } else {
                    draw.current.add(geoJsonData);
                }

                setIsGeometryLoaded(true);
                console.log('Геометрия загружена в Draw контрол');
            } catch (error) {
                console.error('Ошибка при загрузке геометрии в Draw:', error);
            }
        }
    }, [geometry, isMapReady, editable]);

    // Отображение геометрии на карте (только для просмотра, не для редактирования)
    useEffect(() => {
        if (!map.current || !isMapReady) return;
        if (editable) return; // В режиме редактирования Draw сам управляет отображением

        const sourceId = 'geometry-source';
        const layerId = 'geometry-layer';
        const outlineId = 'geometry-outline';

        // Удаляем старые слои
        if (map.current.getLayer(layerId)) {
            map.current.removeLayer(layerId);
        }
        if (map.current.getLayer(outlineId)) {
            map.current.removeLayer(outlineId);
        }
        if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
        }

        if (!geometry) return;

        // Нормализуем GeoJSON
        let geoJsonData = geometry;
        if (geometry.type && ['Point', 'LineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)) {
            geoJsonData = {
                type: 'Feature',
                geometry: geometry,
                properties: {},
            };
        }

        try {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: geoJsonData,
            });

            const geomType = geoJsonData.geometry?.type || geoJsonData.type;

            if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
                map.current.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: sourceId,
                    paint: {
                        'fill-color': '#3b82f6',
                        'fill-opacity': 0.4,
                        'fill-outline-color': '#1e40af',
                    },
                });
                map.current.addLayer({
                    id: outlineId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#1e40af',
                        'line-width': 3,
                    },
                });
            } else if (geomType === 'LineString') {
                map.current.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#ef4444',
                        'line-width': 4,
                    },
                });
            } else if (geomType === 'Point') {
                map.current.addLayer({
                    id: layerId,
                    type: 'circle',
                    source: sourceId,
                    paint: {
                        'circle-radius': 8,
                        'circle-color': '#10b981',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                });
            }

            // Подгоняем карту под границы
            const bounds = new mapboxgl.LngLatBounds();
            const coords = geoJsonData.geometry?.coordinates || geoJsonData.coordinates;

            if (coords) {
                const addCoordsToBounds = (coordArray: any) => {
                    if (Array.isArray(coordArray)) {
                        if (typeof coordArray[0] === 'number' && typeof coordArray[1] === 'number') {
                            bounds.extend([coordArray[0], coordArray[1]]);
                        } else {
                            coordArray.forEach(addCoordsToBounds);
                        }
                    }
                };

                addCoordsToBounds(coords);

                if (!bounds.isEmpty()) {
                    map.current.fitBounds(bounds, {
                        padding: { top: 50, bottom: 50, left: 50, right: 50 },
                        maxZoom: 18,
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка при добавлении геометрии на карту:', error);
        }
    }, [geometry, isMapReady, editable]);

    // Обновляем размер карты
    useEffect(() => {
        setTimeout(() => {
            map.current?.resize();
        }, 100);
    }, [height]);

    // Обработчики для редактирования
    const startDrawing = (mode: 'polygon' | 'line' | 'point') => {
        if (!draw.current) return;

        let drawMode = '';
        switch (mode) {
            case 'polygon':
                drawMode = 'draw_polygon';
                break;
            case 'line':
                drawMode = 'draw_line_string';
                break;
            case 'point':
                drawMode = 'draw_point';
                break;
        }

        draw.current.changeMode(drawMode);
    };

    const updateGeometry = () => {
        if (!draw.current) return;
        const data = draw.current.getAll();

        let resultGeometry = null;
        if (data.features.length === 1) {
            resultGeometry = data.features[0].geometry;
        } else if (data.features.length > 1) {
            resultGeometry = {
                type: 'FeatureCollection',
                features: data.features,
            };
        }

        console.log('Обновлённая геометрия:', resultGeometry);
        onGeometryChange?.(resultGeometry);
    };

    const clearGeometry = () => {
        if (!draw.current) return;
        draw.current.deleteAll();
        setIsGeometryLoaded(false);
        onGeometryChange?.(null);
    };

    // Слушаем изменения в режиме редактирования
    useEffect(() => {
        if (!editable || !draw.current || !map.current) return;

        map.current.on('draw.create', updateGeometry);
        map.current.on('draw.update', updateGeometry);
        map.current.on('draw.delete', updateGeometry);

        return () => {
            map.current?.off('draw.create', updateGeometry);
            map.current?.off('draw.update', updateGeometry);
            map.current?.off('draw.delete', updateGeometry);
        };
    }, [editable]);

    return (
        <div className="space-y-2">
            {editable && (
                <div className="flex gap-2 flex-wrap mb-2">
                    <button
                        onClick={() => startDrawing('polygon')}
                        className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        ➕ Добавить полигон
                    </button>
                    <button
                        onClick={() => startDrawing('line')}
                        className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        📏 Добавить линию
                    </button>
                    <button
                        onClick={() => startDrawing('point')}
                        className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        📍 Добавить точку
                    </button>
                    <button
                        onClick={clearGeometry}
                        className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        🗑️ Очистить всё
                    </button>
                </div>
            )}

            <div
                ref={mapContainer}
                style={{ height, width: '100%', minHeight: '300px' }}
                className="rounded-lg overflow-hidden shadow-md"
            />

            {editable && (
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    💡 Подсказка: нажмите на существующий полигон, чтобы редактировать его точки
                </div>
            )}
        </div>
    );
};