import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { MapProperty, FloorPlan } from '../types';
import type { Equipment } from '../../equipment/types';

interface SyncQueueItem {
  id?: number;  // Auto-incremented
  type: 'property' | 'equipment' | 'floorPlan';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

interface FieldMapDB extends DBSchema {
  properties: {
    key: string;
    value: MapProperty;
    indexes: {
      'location': [number, number];
    };
  };
  equipment: {
    key: string;
    value: Equipment;
    indexes: {
      'location': [number, number];
      'property': string;
    };
  };
  floorPlans: {
    key: string;
    value: FloorPlan;
    indexes: {
      'property': string;
    };
  };
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    autoIncrement: true;
  };
}

const DB_NAME = 'fieldmap_offline';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB database
 */
export const initDB = async (): Promise<IDBPDatabase<FieldMapDB>> => {
  console.log('Initializing offline database');
  
  try {
    const db = await openDB<FieldMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Properties store
        if (!db.objectStoreNames.contains('properties')) {
          const propertyStore = db.createObjectStore('properties', {
            keyPath: 'property_id'
          });
          propertyStore.createIndex('location', 'location.coordinates');
        }

        // Equipment store
        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', {
            keyPath: 'equipment_id'
          });
          equipmentStore.createIndex('location', 'location.coordinates');
          equipmentStore.createIndex('property', 'property_id');
        }

        // Floor plans store
        if (!db.objectStoreNames.contains('floorPlans')) {
          const floorPlanStore = db.createObjectStore('floorPlans', {
            keyPath: 'id'
          });
          floorPlanStore.createIndex('property', 'propertyId');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      }
    });

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Save properties to offline storage
 */
export const saveProperties = async (
  properties: MapProperty[]
): Promise<void> => {
  console.log('Saving properties to offline storage:', properties.length);
  
  const db = await initDB();
  const tx = db.transaction('properties', 'readwrite');

  try {
    await Promise.all([
      ...properties.map(property => tx.store.put(property)),
      tx.done
    ]);
    console.log('Properties saved successfully');
  } catch (error) {
    console.error('Failed to save properties:', error);
    throw error;
  }
};

/**
 * Save equipment to offline storage
 */
export const saveEquipment = async (
  equipment: Equipment[]
): Promise<void> => {
  console.log('Saving equipment to offline storage:', equipment.length);
  
  const db = await initDB();
  const tx = db.transaction('equipment', 'readwrite');

  try {
    await Promise.all([
      ...equipment.map(item => tx.store.put(item)),
      tx.done
    ]);
    console.log('Equipment saved successfully');
  } catch (error) {
    console.error('Failed to save equipment:', error);
    throw error;
  }
};

/**
 * Save floor plans to offline storage
 */
export const saveFloorPlans = async (
  floorPlans: FloorPlan[]
): Promise<void> => {
  console.log('Saving floor plans to offline storage:', floorPlans.length);
  
  const db = await initDB();
  const tx = db.transaction('floorPlans', 'readwrite');

  try {
    await Promise.all([
      ...floorPlans.map(plan => tx.store.put(plan)),
      tx.done
    ]);
    console.log('Floor plans saved successfully');
  } catch (error) {
    console.error('Failed to save floor plans:', error);
    throw error;
  }
};

/**
 * Get properties within bounds
 */
export const getPropertiesInBounds = async (
  bounds: [number, number, number, number]
): Promise<MapProperty[]> => {
  console.log('Fetching properties within bounds:', bounds);
  
  const [west, south, east, north] = bounds;
  const db = await initDB();

  try {
    const properties = await db.getAll('properties');
    return properties.filter(property => {
      const [lng, lat] = property.location.coordinates;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }
};

/**
 * Get equipment within bounds
 */
export const getEquipmentInBounds = async (
  bounds: [number, number, number, number]
): Promise<Equipment[]> => {
  console.log('Fetching equipment within bounds:', bounds);
  
  const [west, south, east, north] = bounds;
  const db = await initDB();

  try {
    const equipment = await db.getAll('equipment');
    return equipment.filter(item => {
      const [lng, lat] = item.location.coordinates;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    });
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    throw error;
  }
};

/**
 * Add item to sync queue
 */
export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> => {
  console.log('Adding item to sync queue:', item);
  
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');

  try {
    await tx.store.add({
      ...item,
      timestamp: Date.now()
    });
    await tx.done;
    console.log('Item added to sync queue successfully');
  } catch (error) {
    console.error('Failed to add item to sync queue:', error);
    throw error;
  }
};

/**
 * Get pending sync items
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  console.log('Fetching sync queue');
  
  const db = await initDB();
  try {
    return await db.getAll('syncQueue');
  } catch (error) {
    console.error('Failed to fetch sync queue:', error);
    throw error;
  }
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async (): Promise<void> => {
  console.log('Clearing sync queue');
  
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');

  try {
    await tx.store.clear();
    await tx.done;
    console.log('Sync queue cleared successfully');
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
    throw error;
  }
};

/**
 * Clear all offline data
 */
export const clearOfflineData = async (): Promise<void> => {
  console.log('Clearing all offline data');
  
  const db = await initDB();
  const stores = ['properties', 'equipment', 'floorPlans', 'syncQueue'] as const;

  try {
    await Promise.all(
      stores.map(store => {
        const tx = db.transaction(store, 'readwrite');
        return tx.store.clear();
      })
    );
    console.log('Offline data cleared successfully');
  } catch (error) {
    console.error('Failed to clear offline data:', error);
    throw error;
  }
};
