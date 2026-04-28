import * as turf from '@turf/turf';
import mapboxgl from "mapbox-gl";
import {MultiPolygon, Point, Polygon} from "geojson";

export const calculateDimension = (geometry): { width: number, length: number } => {
    // Вычисляем размеры
    const bbox = turf.bbox(geometry);
    const width = turf.distance(
        [bbox[0], bbox[1]],
        [bbox[2], bbox[1]],
        {units: 'meters'}
    );
    const length = turf.distance(
        [bbox[0], bbox[1]],
        [bbox[0], bbox[3]],
        {units: 'meters'}
    );
    return {width, length}
}

// Расчет площади с использованием turf.js (для предпросмотра)
export const calculatePolygonAreaTurf = (geometry: any): number => {
    if (!geometry) return 0;

    try {
        const feature = turf.feature(geometry);
        const area = turf.area(feature); // площадь в м²
        return area;
    } catch (error) {
        console.error('Ошибка расчета площади:', error);
        return 0;
    }
};

// Конвертация м² в гектары
export const squareMetersToHectares = (areaInMeters: number): number => {
    return areaInMeters / 10000;
};

// Конвертация гектаров в м²
export const hectaresToSquareMeters = (areaInHectares: number): number => {
    return areaInHectares * 10000;
};

// Форматирование площади (входные данные — ГЕКТАРЫ от бэкенда)
export const formatArea = (areaInHectares: number | undefined): string => {
    if (!areaInHectares || areaInHectares === 0) return '—';

    // Если площадь меньше 1 гектара — показываем в м²
    if (areaInHectares < 0.5) {
        const squareMeters = areaInHectares * 10000;
        return `${squareMeters.toFixed(1)} м²`;
    }

    // Если площадь больше или равна 1 гектару — показываем в га
    if (areaInHectares >= 100) {
        return `${areaInHectares.toFixed(0)} га`;
    }
    if (areaInHectares >= 10) {
        return `${areaInHectares.toFixed(1)} га`;
    }
    return `${areaInHectares.toFixed(2)} га`;
};

// Форматирование площади с явным указанием единиц (для детальной страницы)
export const formatAreaDetailed = (areaInHectares: number): { value: number; unit: string; display: string } => {
    if (!areaInHectares || areaInHectares === 0) {
        return {value: 0, unit: 'м²', display: '—'};
    }

    if (areaInHectares < 1) {
        const squareMeters = areaInHectares * 10000;
        return {
            value: squareMeters,
            unit: 'м²',
            display: `${squareMeters.toFixed(0)} м²`
        };
    }

    return {
        value: areaInHectares,
        unit: 'га',
        display: `${areaInHectares.toFixed(2)} га`
    };
};

// Получить площадь в м² (для теплиц и маленьких полей)
export const getAreaInSquareMeters = (areaInHectares: number): number => {
    return areaInHectares * 10000;
};

// Расчет площади из GeoJSON (для предпросмотра на фронте)
export const getAreaFromGeoJSON = (geojson: any): { squareMeters: number; hectares: number } => {
    if (!geojson) return {squareMeters: 0, hectares: 0};

    let geometry = geojson;
    if (geojson.type === 'Feature') {
        geometry = geojson.geometry;
    }

    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
        return {squareMeters: 0, hectares: 0};
    }

    const squareMeters = calculatePolygonAreaTurf(geometry);
    return {
        squareMeters,
        hectares: squareMeters / 10000,
    };
};

export const calculateCenter = (geometry: Polygon | Point | MultiPolygon): {
    zoom: number,
    center: [number, number]
} => {
    let bounds: mapboxgl.LngLatBounds | null = null;
    let zoom = 12;
    if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
        const coordinates = geometry.coordinates[0] as [number, number][];

        coordinates.forEach(coord => {
            if (!bounds) {
                bounds = new mapboxgl.LngLatBounds([coord[0], coord[1]], [coord[0], coord[1]]);
            } else {
                bounds.extend([coord[0], coord[1]]);
            }
        });

        const polygon = turf.polygon([coordinates]);
        const centerPoint = turf.center(polygon);
        if (bounds) {
            const lngSpan = bounds.getEast() - bounds.getWest();

            const latSpan = bounds.getNorth() - bounds.getSouth();
            if (lngSpan > 0.5 || latSpan > 0.5) {
                zoom = 11;
            } else if (lngSpan > 0.2 || latSpan > 0.2) {
                zoom = 12;
            } else if (lngSpan > 0.05 || latSpan > 0.05) {
                zoom = 13;
            } else {
                zoom = 14;
            }
        }
        if (centerPoint == undefined) {
            return {zoom, center: [0, 0]}
        }
        return {zoom, center: centerPoint.geometry.coordinates as [number, number]};

    } else if (geometry.type === 'Point' && geometry.coordinates) {
        return {zoom, center: geometry.coordinates as [number, number]};
    }
}