'use client';

import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridStyles } from '@/styles/dataGrid';

interface Job {
    job_id: string;
    job_type: {
        job_type_id: string;
        job_name: string;
    };
    property_id: string;
    created_at: string;
    updated_at: string;
}

const columns: GridColDef[] = [
    {
        field: 'job_type',
        headerName: 'Job Type',
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => params.value.job_name
    },
    {
        field: 'property_id',
        headerName: 'Property',
        flex: 1,
        minWidth: 200
    },
    {
        field: 'created_at',
        headerName: 'Created',
        width: 180,
        valueGetter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
        field: 'updated_at',
        headerName: 'Last Updated',
        width: 180,
        valueGetter: (params) => new Date(params.value).toLocaleDateString()
    }
];

// TODO: Replace with actual data fetching
const mockJobs: Job[] = [];

export default function JobsTable() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [jobs] = useState<Job[]>(mockJobs);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={jobs}
                columns={columns}
                getRowId={(row) => row.job_id}
                page={page}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 20]}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                disableSelectionOnClick
                sx={dataGridStyles}
            />
        </Box>
    );
}
