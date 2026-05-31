// ==================== MAP COMPONENT ====================

import {ProductionUnit} from "@/entities/spatial";
import {useEffect, useRef, useState} from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const FieldsMap = ({fields, onSelectField}: {
    fields: ProductionUnit[];
    onSelectField: (field: ProductionUnit) => void
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

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
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [30.33, 45.73],
            zoom: 11,
            attributionControl: false,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded || !fields.length) return;

        if (map.current.getLayer('fields-fill')) {
            map.current.removeLayer('fields-fill');
            map.current.removeLayer('fields-outline');
            map.current.removeSource('fields');
        }

        const features: any[] = [];

        fields.forEach(field => {
            if (field.geometry?.type === 'Polygon' && field.geometry.coordinates) {
                features.push({
                    type: 'Feature',
                    id: field.id,
                    properties: {
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        area: field.geometry.area,
                        status: field.status
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: field.geometry.coordinates
                    }
                });
            }
        });

        if (features.length === 0) return;

        map.current.addSource('fields', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        map.current.addLayer({
            id: 'fields-fill',
            type: 'fill',
            source: 'fields',
            paint: {
                'fill-color': [
                    'match',
                    ['get', 'status'],
                    'maintenance', '#f59e0b',
                    '#22c55e'
                ],
                'fill-opacity': 0.4
            }
        });

        map.current.addLayer({
            id: 'fields-outline',
            type: 'line',
            source: 'fields',
            paint: {
                'line-color': '#16a34a',
                'line-width': 2
            }
        });

        map.current.on('click', 'fields-fill', (e) => {
            if (e.features?.length) {
                const fieldId = e.features[0].properties?.id;
                const field = fields.find(f => f.id === fieldId);
                if (field) onSelectField(field);
            }
        });

        map.current.on('mouseenter', 'fields-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'fields-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
        });

        try {
            const bounds = new mapboxgl.LngLatBounds();
            features.forEach((feature) => {
                feature.geometry.coordinates[0].forEach((coord: number[]) => {
                    bounds.extend(coord as [number, number]);
                });
            });
            map.current.fitBounds(bounds, {padding: 50, duration: 1000});
        } catch (e) {
            console.error('Error centering map:', e);
        }
    }, [fields, mapLoaded, onSelectField]);

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-200px)]">
            <div ref={mapContainer} className="absolute inset-0 rounded-xl overflow-hidden"
                 style={{background: '#1a1a2e'}}/>
        </div>
    );
};
