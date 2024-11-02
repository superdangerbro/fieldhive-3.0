import { useCallback, useEffect, useState } from 'react';
import type { Equipment } from '../../equipment/types';
import type { Task, Visit } from '../types';

interface UseVisitWorkflowOptions {
  /** Current visit data */
  visit?: Visit;
  /** Available equipment */
  equipment?: Equipment[];
  /** Callback when visit is completed */
  onVisitComplete?: (visit: Visit) => void;
  /** Callback when task is completed */
  onTaskComplete?: (task: Task) => void;
}

/**
 * Hook for managing visit workflow and task progression
 * 
 * Features:
 * - Step-by-step task guidance
 * - Task validation
 * - Progress tracking
 * - Location verification
 * 
 * @param options - Configuration options
 * @returns Visit workflow utilities and state
 */
export function useVisitWorkflow(options: UseVisitWorkflowOptions = {}) {
  const {
    visit,
    equipment,
    onVisitComplete,
    onTaskComplete
  } = options;

  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);

  // Initialize first task
  useEffect(() => {
    if (visit && !currentTask) {
      const nextTask = visit.tasks.find(task => task.status === 'pending');
      if (nextTask) {
        console.log('Starting task:', nextTask.id);
        setCurrentTask(nextTask);
      }
    }
  }, [visit, currentTask]);

  /**
   * Calculate visit progress
   */
  const getProgress = useCallback((): number => {
    if (!visit) return 0;
    
    const total = visit.tasks.length;
    const completed = completedTasks.length;
    return total > 0 ? (completed / total) * 100 : 0;
  }, [visit, completedTasks]);

  /**
   * Validate task location
   */
  const validateLocation = useCallback(async (
    currentLocation: [number, number],
    taskLocation: [number, number]
  ): Promise<boolean> => {
    setIsValidatingLocation(true);
    
    try {
      // Calculate distance between points
      const R = 6371e3; // Earth's radius in meters
      const φ1 = currentLocation[1] * Math.PI/180;
      const φ2 = taskLocation[1] * Math.PI/180;
      const Δφ = (taskLocation[1] - currentLocation[1]) * Math.PI/180;
      const Δλ = (taskLocation[0] - currentLocation[0]) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Allow 10-meter radius
      return distance <= 10;
    } catch (error) {
      console.error('Location validation failed:', error);
      return false;
    } finally {
      setIsValidatingLocation(false);
    }
  }, []);

  /**
   * Complete current task
   */
  const completeTask = useCallback(async (notes?: string) => {
    if (!currentTask || !visit) return;

    console.log('Completing task:', currentTask.id);

    // Update task status
    const updatedTask: Task = {
      ...currentTask,
      status: 'completed',
      notes
    };

    // Update completed tasks
    setCompletedTasks(prev => [...prev, currentTask.id]);
    onTaskComplete?.(updatedTask);

    // Find next task
    const nextTask = visit.tasks.find(
      task => task.status === 'pending' && !completedTasks.includes(task.id)
    );

    if (nextTask) {
      console.log('Moving to next task:', nextTask.id);
      setCurrentTask(nextTask);
    } else {
      console.log('All tasks completed');
      setCurrentTask(null);
      onVisitComplete?.(visit);
    }
  }, [currentTask, visit, completedTasks, onTaskComplete, onVisitComplete]);

  /**
   * Skip current task
   */
  const skipTask = useCallback((reason: string) => {
    if (!currentTask || currentTask.required) return;

    console.log('Skipping task:', currentTask.id, 'Reason:', reason);

    const updatedTask: Task = {
      ...currentTask,
      status: 'skipped',
      notes: reason
    };

    // Find next task
    const nextTask = visit?.tasks.find(
      task => task.status === 'pending' && !completedTasks.includes(task.id)
    );

    if (nextTask) {
      setCurrentTask(nextTask);
    } else {
      setCurrentTask(null);
    }

    onTaskComplete?.(updatedTask);
  }, [currentTask, visit, completedTasks, onTaskComplete]);

  return {
    // State
    currentTask,
    completedTasks,
    isValidatingLocation,
    progress: getProgress(),

    // Task management
    completeTask,
    skipTask,
    validateLocation,

    // Utilities
    getProgress,
    hasRequiredTasks: visit?.tasks.some(task => task.required && task.status === 'pending') ?? false,
    isComplete: visit?.tasks.every(task => 
      task.status === 'completed' || task.status === 'skipped'
    ) ?? false
  };
}
