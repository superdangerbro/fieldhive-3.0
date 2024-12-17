'use client';

import { useState, useCallback, useRef } from 'react';
import type { ViewState } from 'react-map-gl';

interface UseMapMovementOptions {
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  debounceMs?: number;
}

const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -95,
  latitude: 37,
  zoom: 3.5,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 }
};

export function useMapMovement({ onBoundsChange, debounceMs = 300 }: UseMapMovementOptions = {}) {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);

  // Use a ref to store the timeout ID
  const debounceTimeout = useRef<NodeJS.Timeout>();
  // Use a ref to store the latest bounds to prevent stale closures
  const latestBounds = useRef<[number, number, number, number] | null>(null);

  const handleViewStateChange = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  const handleMoveEnd = useCallback((bounds: [number, number, number, number]) => {
    // Store the latest bounds
    latestBounds.current = bounds;

    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      if (latestBounds.current && !latestBounds.current.some(isNaN)) {
        onBoundsChange?.(latestBounds.current);
      }
    }, debounceMs);
  }, [onBoundsChange, debounceMs]);

  return {
    viewState,
    handleViewStateChange,
    handleMoveEnd,
    setViewState
  };
}
