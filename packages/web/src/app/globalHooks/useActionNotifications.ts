'use client';

import { create } from 'zustand';

interface NotificationState {
    successMessage: string | null;
    errorMessage: string | null;
}

interface NotificationStore extends NotificationState {
    notifySuccess: (message: string) => void;
    notifyError: (message: string) => void;
    clearNotifications: () => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
    successMessage: null,
    errorMessage: null,
    notifySuccess: (message) => {
        console.log('Success notification:', message);
        set({ successMessage: message, errorMessage: null });
        setTimeout(() => {
            set((state) => {
                // Only clear if this is still the current message
                if (state.successMessage === message) {
                    return { successMessage: null, errorMessage: null };
                }
                return state;
            });
        }, 3000);
    },
    notifyError: (message) => {
        console.error('Error notification:', message);
        set({ successMessage: null, errorMessage: message });
        setTimeout(() => {
            set((state) => {
                // Only clear if this is still the current message
                if (state.errorMessage === message) {
                    return { successMessage: null, errorMessage: null };
                }
                return state;
            });
        }, 3000);
    },
    clearNotifications: () => set({ successMessage: null, errorMessage: null })
}));

export function useActionNotifications() {
    const store = useNotificationStore();

    return {
        notificationState: {
            successMessage: store.successMessage,
            errorMessage: store.errorMessage
        },
        notifySuccess: store.notifySuccess,
        notifyError: store.notifyError,
        clearNotifications: store.clearNotifications
    };
}
