import { alpha } from '@mui/material';

export const dataGridStyles = {
    border: 'none',
    '& .MuiDataGrid-cell:focus': {
        outline: 'none',
    },
    '& .MuiDataGrid-row': {
        '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.08)',
        }
    },
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderBottom: '1px solid',
        borderColor: 'divider',
    },
    '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid',
        borderColor: 'divider',
    },
    '& .MuiDataGrid-virtualScroller': {
        backgroundColor: 'transparent',
    },
    '& .MuiDataGrid-toolbarContainer': {
        padding: 2,
        gap: 2,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottom: '1px solid',
        borderColor: 'divider',
    },
    '& .MuiButton-root': {
        textTransform: 'none',
    },
    '& .MuiDataGrid-cell': {
        borderColor: 'divider',
    },
    '& .MuiDataGrid-columnSeparator': {
        color: 'divider',
    },
    '& .MuiDataGrid-selectedRowCount': {
        color: 'text.secondary',
    },
    '& .MuiDataGrid-menuIcon': {
        color: 'text.secondary',
    },
    '& .MuiDataGrid-sortIcon': {
        color: 'text.secondary',
    },
    '& .MuiDataGrid-filterIcon': {
        color: 'text.secondary',
    },
    '& .MuiDataGrid-overlay': {
        backgroundColor: alpha('#0f172a', 0.8),
    },
    '& .MuiDataGrid-toolbar': {
        '& .MuiButton-root': {
            color: 'text.secondary',
            '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.08)',
            },
        },
        '& .MuiFormControl-root': {
            minWidth: 200,
        },
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
    },
    '& .MuiDataGrid-cellContent': {
        color: 'text.primary',
    },
    '& .MuiDataGrid-footerContainer .MuiTablePagination-root': {
        color: 'text.secondary',
    },
    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
        },
    },
};
