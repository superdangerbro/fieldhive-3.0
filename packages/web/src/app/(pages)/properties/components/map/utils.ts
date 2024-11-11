import { displayToGeoJson, validateLatLng } from '../../types/location';
import type { GeoJSONPolygon } from '../../types/location';

export function createGeoJsonPolygon(points: Array<[number, number]>): GeoJSONPolygon | null {
    if (!points?.length) return null;
    if (points.length < 3) return null;

    try {
        // Convert display coordinates [lat, lng] to GeoJSON [lng, lat]
        const geoJsonPoints: [number, number][] = points.map(point => {
            if (!point || !validateLatLng(point[0], point[1])) {
                return [0, 0];
            }
            return displayToGeoJson(point);
        });
        
        // Ensure polygon is closed
        const closedPoints = [...geoJsonPoints];
        const firstPoint = closedPoints[0];
        const lastPoint = closedPoints[closedPoints.length - 1];
        
        if (firstPoint && lastPoint && 
            (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])) {
            closedPoints.push([...firstPoint]);
        }

        return {
            type: 'Polygon',
            coordinates: [closedPoints]
        };
    } catch (err) {
        console.error('Error creating GeoJSON polygon:', err);
        return null;
    }
}

export function createGeoJsonLineString(points: Array<[number, number]>) {
    try {
        // Convert display coordinates [lat, lng] to GeoJSON [lng, lat]
        const geoJsonPoints: [number, number][] = (points || []).map(point => {
            if (!point || !validateLatLng(point[0], point[1])) {
                return [0, 0];
            }
            return displayToGeoJson(point);
        });
        
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: geoJsonPoints
            },
            properties: {}
        };
    } catch (err) {
        console.error('Error creating GeoJSON line string:', err);
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: []
            },
            properties: {}
        };
    }
}

export function createGeoJsonPolygonFeature(points: Array<[number, number]>) {
    if (!points?.length) return null;
    if (points.length < 3) return null;

    try {
        // Convert display coordinates [lat, lng] to GeoJSON [lng, lat]
        const geoJsonPoints: [number, number][] = points.map(point => {
            if (!point || !validateLatLng(point[0], point[1])) {
                return [0, 0];
            }
            return displayToGeoJson(point);
        });
        
        // Close the polygon
        const closedPoints = [...geoJsonPoints];
        const firstPoint = closedPoints[0];
        const lastPoint = closedPoints[closedPoints.length - 1];
        
        if (firstPoint && lastPoint && 
            (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1])) {
            closedPoints.push([...firstPoint]);
        }

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [closedPoints]
            },
            properties: {}
        };
    } catch (err) {
        console.error('Error creating GeoJSON polygon feature:', err);
        return null;
    }
}

export function findInsertionPoint(
    points: Array<[number, number]>,
    newPoint: [number, number]
): { index: number; distance: number } {
    try {
        if (!points?.length || !newPoint) {
            return { index: 0, distance: Infinity };
        }

        let minDistance = Infinity;
        let insertIndex = points.length;

        for (let i = 0; i < points.length - 1; i++) {
            if (!points[i] || !points[i + 1]) continue;
            
            const distance = distanceToLineSegment(newPoint, points[i], points[i + 1]);
            if (distance < minDistance) {
                minDistance = distance;
                insertIndex = i + 1;
            }
        }

        return { index: insertIndex, distance: minDistance };
    } catch (err) {
        console.error('Error finding insertion point:', err);
        return { index: points?.length || 0, distance: Infinity };
    }
}

export function distanceToLineSegment(
    point: [number, number],
    lineStart: [number, number],
    lineEnd: [number, number]
): number {
    try {
        if (!point || !lineStart || !lineEnd) return Infinity;

        const dx = (lineEnd[0] || 0) - (lineStart[0] || 0);
        const dy = (lineEnd[1] || 0) - (lineStart[1] || 0);
        const len2 = dx * dx + dy * dy;
        
        if (len2 === 0) {
            const px = (point[0] || 0) - (lineStart[0] || 0);
            const py = (point[1] || 0) - (lineStart[1] || 0);
            return Math.sqrt(px * px + py * py);
        }

        let t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / len2;
        t = Math.max(0, Math.min(1, t));

        const projX = (lineStart[0] || 0) + t * dx;
        const projY = (lineStart[1] || 0) + t * dy;
        const px = (point[0] || 0) - projX;
        const py = (point[1] || 0) - projY;

        return Math.sqrt(px * px + py * py);
    } catch (err) {
        console.error('Error calculating distance:', err);
        return Infinity;
    }
}
