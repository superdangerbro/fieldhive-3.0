'use client';

import { useState, useCallback } from 'react';

interface CrudDialogState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete';
    data?: any;
}

export function useCrudDialogs(initialState: Partial<CrudDialogState> = {}) {
    const [dialogState, setDialogState] = useState<CrudDialogState>({
        isOpen: false,
        mode: 'create',
        data: null,
        ...initialState
    });

    const openCreateDialog = useCallback(() => {
        setDialogState({
            isOpen: true,
            mode: 'create',
            data: null
        });
    }, []);

    const openEditDialog = useCallback((data: any) => {
        setDialogState({
            isOpen: true,
            mode: 'edit',
            data
        });
    }, []);

    const openDeleteDialog = useCallback((data: any) => {
        setDialogState({
            isOpen: true,
            mode: 'delete',
            data
        });
    }, []);

    const closeDialog = useCallback(() => {
        setDialogState(prev => ({
            ...prev,
            isOpen: false,
            data: null
        }));
    }, []);

    return {
        dialogState,
        openCreateDialog,
        openEditDialog,
        openDeleteDialog,
        closeDialog
    };
}
