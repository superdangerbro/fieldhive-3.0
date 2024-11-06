'use client';

import { useState, useCallback } from 'react';

interface ActionNotificationState {
    successMessage: string | null;
    errorMessage: string | null;
}

export function useActionNotifications() {
    const [notificationState, setNotificationState] = useState<ActionNotificationState>({
        successMessage: null,
        errorMessage: null
    });

    const notifySuccess = useCallback((message: string) => {
        setNotificationState(prev => ({
            ...prev,
            successMessage: message
        }));
    }, []);

    const notifyError = useCallback((message: string) => {
        setNotificationState(prev => ({
            ...prev,
            errorMessage: message
        }));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotificationState({
            successMessage: null,
            errorMessage: null
        });
    }, []);

    const notifyAction = useCallback((action: string, type: string, success: boolean) => {
        if (success) {
            notifySuccess(`${type} ${action} successfully`);
        } else {
            notifyError(`Failed to ${action.toLowerCase()} ${type.toLowerCase()}`);
        }
    }, [notifySuccess, notifyError]);

    return {
        notificationState,
        notifySuccess,
        notifyError,
        notifyAction,
        clearNotifications
    };
}
