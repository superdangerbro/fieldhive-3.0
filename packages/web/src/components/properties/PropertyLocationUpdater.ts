import { updateProperty, getPropertyLocation } from '../../services/api';
import type { UpdatePropertyDto } from '@fieldhive/shared';

interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number];
}

interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: Array<Array<[number, number]>>;
}

export class PropertyLocationUpdater {
    private propertyId: string;

    constructor(propertyId: string) {
        this.propertyId = propertyId;
    }

    async updateLocation(coordinates: [number, number]): Promise<any> {
        try {
            console.log('Updating location with coordinates:', coordinates);
            const point: GeoJSONPoint = {
                type: 'Point',
                coordinates: [coordinates[1], coordinates[0]] // Convert [lat, lng] to [lng, lat]
            };
            
            console.log('Sending location update:', point);
            await updateProperty(this.propertyId, {
                location: point
            });
            
            return await this.refreshLocationData();
        } catch (error) {
            console.error('Failed to update location:', error);
            throw error;
        }
    }

    async updateBoundary(coordinates: Array<[number, number]>): Promise<any> {
        try {
            if (!coordinates || coordinates.length < 3) {
                throw new Error('Polygon must have at least 3 points');
            }

            // Ensure the polygon is closed (first and last points match)
            const closedCoordinates = [...coordinates];
            if (!this.areCoordinatesEqual(closedCoordinates[0], closedCoordinates[closedCoordinates.length - 1])) {
                closedCoordinates.push([...closedCoordinates[0]]);
            }

            const polygon: GeoJSONPolygon = {
                type: 'Polygon',
                coordinates: [closedCoordinates]
            };

            console.log('Sending boundary update:', polygon);
            await updateProperty(this.propertyId, {
                boundary: polygon
            });
            
            return await this.refreshLocationData();
        } catch (error) {
            console.error('Failed to update boundary:', error);
            throw error;
        }
    }

    async clearBoundary(): Promise<any> {
        try {
            console.log('Clearing boundary');
            const update: UpdatePropertyDto = {
                boundary: undefined
            };
            await updateProperty(this.propertyId, update);
            
            return await this.refreshLocationData();
        } catch (error) {
            console.error('Failed to clear boundary:', error);
            throw error;
        }
    }

    private async refreshLocationData(): Promise<any> {
        const response = await getPropertyLocation(this.propertyId);
        return response.data;
    }

    private areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}
