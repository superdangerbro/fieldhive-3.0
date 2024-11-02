import { Repository } from 'typeorm';
import { Equipment } from '../entities/Equipment';
import { 
    NearbyEquipmentQuery,
    SpatialBounds,
    EquipmentCluster,
    RadialSearch 
} from '@fieldhive/shared';

export class SpatialService {
    constructor(private equipmentRepository: Repository<Equipment>) {}

    async findNearbyEquipment(query: NearbyEquipmentQuery): Promise<Equipment[]> {
        const qb = this.equipmentRepository.createQueryBuilder('equipment');

        // Apply location-based filtering
        if (query.location) {
            const { lat, lng } = query.location;
            const maxDistance = query.maxDistance || 1000; // Default to 1km

            qb.where(
                `ST_DWithin(
                    equipment.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :distance
                )`,
                { lat, lng, distance: maxDistance }
            );
        }

        // Apply bounds-based filtering
        if (query.bounds) {
            const { minLat, maxLat, minLng, maxLng } = query.bounds;
            qb.andWhere(
                `equipment.location && ST_MakeEnvelope(
                    :minLng, :minLat,
                    :maxLng, :maxLat,
                    4326
                )`,
                { minLat, maxLat, minLng, maxLng }
            );
        }

        // Apply radial search
        if (query.radial) {
            const { lat, lng, radiusMeters } = query.radial;
            qb.andWhere(
                `ST_DWithin(
                    equipment.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )`,
                { lat, lng, radius: radiusMeters }
            );
        }

        // Apply type filtering
        if (query.types && query.types.length > 0) {
            qb.andWhere('equipment.type IN (:...types)', { types: query.types });
        }

        // Apply status filtering
        if (query.status && query.status.length > 0) {
            qb.andWhere('equipment.status IN (:...statuses)', { statuses: query.status });
        }

        // Apply limit
        if (query.limit) {
            qb.limit(query.limit);
        }

        return qb.getMany();
    }

    async clusterEquipment(bounds: SpatialBounds, gridSize: number = 50): Promise<EquipmentCluster[]> {
        const clusters: EquipmentCluster[] = [];
        const equipment = await this.equipmentRepository
            .createQueryBuilder('equipment')
            .where(
                `equipment.location && ST_MakeEnvelope(
                    :minLng, :minLat,
                    :maxLng, :maxLat,
                    4326
                )`,
                bounds
            )
            .getMany();

        // Simple grid-based clustering
        const latStep = (bounds.maxLat - bounds.minLat) / gridSize;
        const lngStep = (bounds.maxLng - bounds.minLng) / gridSize;

        const grid: Map<string, Equipment[]> = new Map();

        equipment.forEach(eq => {
            if (!eq.location) return;

            const gridX = Math.floor((eq.location.longitude - bounds.minLng) / lngStep);
            const gridY = Math.floor((eq.location.latitude - bounds.minLat) / latStep);
            const key = `${gridX},${gridY}`;

            if (!grid.has(key)) {
                grid.set(key, []);
            }
            grid.get(key)!.push(eq);
        });

        grid.forEach((equipmentList, key) => {
            if (equipmentList.length === 0) return;

            const [gridX, gridY] = key.split(',').map(Number);
            const centerLng = bounds.minLng + (gridX + 0.5) * lngStep;
            const centerLat = bounds.minLat + (gridY + 0.5) * latStep;

            clusters.push({
                id: key,
                count: equipmentList.length,
                center: {
                    latitude: centerLat,
                    longitude: centerLng
                },
                bounds: {
                    minLat: bounds.minLat + gridY * latStep,
                    maxLat: bounds.minLat + (gridY + 1) * latStep,
                    minLng: bounds.minLng + gridX * lngStep,
                    maxLng: bounds.minLng + (gridX + 1) * lngStep
                },
                equipment: equipmentList
            });
        });

        return clusters;
    }
}
