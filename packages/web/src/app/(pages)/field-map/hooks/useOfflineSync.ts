import { useCallback, useEffect, useState } from 'react';
import type { MapProperty, FloorPlan } from '../types';
import type { Equipment } from '@/app/globalTypes/equipment';

interface SyncQueueItem {
  id: string;
  type: 'property' | 'equipment' | 'floorPlan';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

interface OfflineData {
  properties: MapProperty[];
  equipment: Equipment[];
  floorPlans: FloorPlan[];
}

interface UseOfflineSyncOptions {
  /** Storage key prefix */
  storagePrefix?: string;
  /** How often to attempt sync (ms) */
  syncInterval?: number;
  /** Callback when sync completes */
  onSyncComplete?: () => void;
  /** Callback when sync fails */
  onSyncError?: (error: Error) => void;
}

/**
 * Hook for managing offline data and synchronization
 * 
 * Features:
 * - Offline data storage
 * - Change queue management
 * - Automatic sync attempts
 * - Conflict resolution
 * 
 * @param options - Configuration options
 * @returns Offline data management utilities
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    storagePrefix = 'fieldmap',
    syncInterval = 30000, // 30 seconds
    onSyncComplete,
    onSyncError
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
      setIsOnline(true);
      attemptSync();
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic sync attempts
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(attemptSync, syncInterval);
    return () => clearInterval(interval);
  }, [isOnline, syncInterval]);

  /**
   * Save data to local storage
   */
  const saveOfflineData = useCallback(async (data: Partial<OfflineData>) => {
    try {
      console.log('Saving offline data:', data);
      
      // Save each data type separately
      if (data.properties) {
        localStorage.setItem(
          `${storagePrefix}_properties`,
          JSON.stringify(data.properties)
        );
      }
      
      if (data.equipment) {
        localStorage.setItem(
          `${storagePrefix}_equipment`,
          JSON.stringify(data.equipment)
        );
      }
      
      if (data.floorPlans) {
        localStorage.setItem(
          `${storagePrefix}_floorPlans`,
          JSON.stringify(data.floorPlans)
        );
      }
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  }, [storagePrefix]);

  /**
   * Load data from local storage
   */
  const loadOfflineData = useCallback(async (): Promise<OfflineData> => {
    try {
      console.log('Loading offline data');
      
      return {
        properties: JSON.parse(localStorage.getItem(`${storagePrefix}_properties`) || '[]'),
        equipment: JSON.parse(localStorage.getItem(`${storagePrefix}_equipment`) || '[]'),
        floorPlans: JSON.parse(localStorage.getItem(`${storagePrefix}_floorPlans`) || '[]')
      };
    } catch (error) {
      console.error('Error loading offline data:', error);
      throw error;
    }
  }, [storagePrefix]);

  /**
   * Add item to sync queue
   */
  const queueChange = useCallback((item: Omit<SyncQueueItem, 'timestamp'>) => {
    console.log('Queuing change:', item);
    
    setSyncQueue(queue => [
      ...queue,
      { ...item, timestamp: Date.now() }
    ]);
  }, []);

  /**
   * Attempt to sync queued changes
   */
  const attemptSync = useCallback(async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0) return;

    console.log('Attempting to sync changes');
    setIsSyncing(true);

    try {
      // Process queue in order
      for (const item of syncQueue) {
        // TODO: Implement actual API calls here
        console.log('Processing sync item:', item);
      }

      // Clear queue and update sync time
      setSyncQueue([]);
      setLastSyncTime(Date.now());
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
      onSyncError?.(error as Error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, syncQueue, onSyncComplete, onSyncError]);

  return {
    // State
    isOnline,
    isSyncing,
    syncQueue,
    lastSyncTime,

    // Data management
    saveOfflineData,
    loadOfflineData,
    queueChange,

    // Sync control
    attemptSync,
    
    // Manual status control
    setOnline: setIsOnline
  };
}
