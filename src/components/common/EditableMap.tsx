import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PolygonGeometry, PointGeometry } from '../../types/farm';
import { getAreaFromGeoJSON, formatArea } from '../../utils/geometry';

interface EditableMapProps {
    mode: 'polygon' | 'point';
    initialGeometry?: PolygonGeometry | PointGeometry | null;
    height?: string | number;
    onGeometryChange?: (geometry: PolygonGeometry | PointGeometry | null, area?: number) => void;
    center?: [number, number];
    zoom?: number;
}

export const EditableMap: React.FC<EditableMapProps> = ({
                                                            mode,
                                                            initialGeometry,
                                                            height = '400px',
                                                            onGeometryChange,
                                                            center = [37.618423, 55.751244],
                                                            zoom = 14,
                                                        }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [hasGeometry, setHasGeometry] = useState(!!initialGeometry);
    const [area, setArea] = useState<number>(0);

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Функция для расчета площади и обновления
    const updateAreaAndNotify = (geometry: any) => {
        if (!geometry || mode !== 'polygon') {
            setArea(0);
            onGeometryChange?.(geometry, 0);
            return;
        }

        try {
            const calculatedArea = getAreaFromGeoJSON(geometry);
            setArea(calculatedArea);
            console.log('Расчет площади:', calculatedArea, formatArea(calculatedArea));
            // Передаем геометрию и площадь
            onGeometryChange?.(geometry, calculatedArea);
        } catch (error) {
            console.error('Ошибка расчета площади:', error);
            setArea(0);
            onGeometryChange?.(geometry, 0);
        }
    };

    const updateGeometry = () => {
        if (!draw.current) return;

        const data = draw.current.getAll();

        if (data.features.length === 0) {
            setHasGeometry(false);
            setArea(0);
            onGeometryChange?.(null, 0);
            return;
        }

        setHasGeometry(true);

        if (mode === 'polygon') {
            const feature = data.features.find(f => f.geometry.type === 'Polygon');
            if (feature) {
                // Сразу рассчитываем площадь и уведомляем
                updateAreaAndNotify(feature.geometry);
            }
        } else if (mode === 'point') {
            const feature = data.features.find(f => f.geometry.type === 'Point');
            if (feature) {
                onGeometryChange?.(feature.geometry as PointGeometry);
            }
        }
    };

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current) return;

        const container = mapContainer.current;
        const containerHeight = typeof height === 'number' ? `${height}px` : height;
        container.style.height = containerHeight;
        container.style.width = '100%';
        container.style.position = 'relative';

        map.current = new mapboxgl.Map({
            container: container,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: center,
            zoom: zoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        const drawControls: any = { trash: true };
        if (mode === 'polygon') {
            drawControls.polygon = true;
        } else if (mode === 'point') {
            drawControls.point = true;
        }

        draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: drawControls,
            defaultMode: 'simple_select',
        });

        map.current.addControl(draw.current, 'top-left');

        map.current.on('load', () => {
            setIsMapReady(true);
            setTimeout(() => map.current?.resize(), 100);

            if (initialGeometry) {
                try {
                    const feature = {
                        type: 'Feature',
                        geometry: initialGeometry,
                        properties: {},
                    };
                    draw.current?.add(feature);
                    setHasGeometry(true);
                    if (mode === 'polygon') {
                        // Рассчитываем площадь для начальной геометрии
                        updateAreaAndNotify(initialGeometry);
                    }

                    if (initialGeometry.type === 'Polygon' && initialGeometry.coordinates) {
                        const bounds = new mapboxgl.LngLatBounds();
                        initialGeometry.coordinates[0].forEach((coord: number[]) => {
                            bounds.extend([coord[0], coord[1]]);
                        });
                        map.current?.fitBounds(bounds, { padding: 50 });
                    } else if (initialGeometry.type === 'Point' && initialGeometry.coordinates) {
                        map.current?.setCenter([initialGeometry.coordinates[0], initialGeometry.coordinates[1]]);
                        map.current?.setZoom(18);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки геометрии:', error);
                }
            }
        });

        map.current.on('draw.create', updateGeometry);
        map.current.on('draw.update', updateGeometry);
        map.current.on('draw.delete', updateGeometry);

        return () => {
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (map.current && isMapReady) {
            setTimeout(() => map.current?.resize(), 100);
        }
    }, [height, isMapReady]);

    const clearGeometry = () => {
        if (!draw.current) return;
        draw.current.deleteAll();
        setHasGeometry(false);
        setArea(0);
        onGeometryChange?.(null, 0);
    };

    return (
        <div className="space-y-2 h-full w-full">
            <div
                ref={mapContainer}
                style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%', minHeight: '300px' }}
                className="rounded-lg overflow-hidden shadow-md"
            />

            <div className="flex gap-2 justify-between items-center">
                {mode === 'polygon' && hasGeometry && area > 0 && (
                    <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                        📐 Площадь: <span className="font-bold">{formatArea(area)}</span>
                    </div>
                )}

                <div className="flex gap-2 ml-auto">
                    {hasGeometry && (
                        <button
                            onClick={clearGeometry}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                            🗑️ Очистить
                        </button>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500">
                {mode === 'polygon'
                    ? '💡 Нарисуйте границы поля на карте. Кликайте для добавления точек, двойной клик для завершения.'
                    : '💡 Нажмите на карту, чтобы отметить центр теплицы.'}
            </div>
        </div>
    );
};