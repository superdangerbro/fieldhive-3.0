'use client';

import React from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
            sx={{ py: 3 }}
        >
            {value === index && children}
        </Box>
    );
}

export default function SettingsPage() {
    const [tabValue, setTabValue] = React.useState(0);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<{ id: string; name: string } | null>(null);

    // TODO: Replace with actual data fetching
    const jobTypes = [
        { id: '1', name: 'Inspection' },
        { id: '2', name: 'Maintenance' }
    ];

    const equipmentTypes = [
        { id: '1', name: 'Trap' },
        { id: '2', name: 'Sensor' }
    ];

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAdd = () => {
        setEditItem(null);
        setIsAddDialogOpen(true);
    };

    const handleEdit = (item: { id: string; name: string }) => {
        setEditItem(item);
        setIsAddDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete functionality
        console.log('Delete item:', id);
    };

    const handleSave = (name: string) => {
        // TODO: Implement save functionality
        console.log('Save item:', editItem ? 'edit' : 'add', name);
        setIsAddDialogOpen(false);
        setEditItem(null);
    };

    const renderList = (items: { id: string; name: string }[]) => (
        <List>
            {items.map((item) => (
                <ListItem
                    key={item.id}
                    secondaryAction={
                        <Box>
                            <IconButton edge="end" onClick={() => handleEdit(item)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    }
                >
                    <ListItemText primary={item.name} />
                </ListItem>
            ))}
        </List>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings
            </Typography>

            <Paper sx={{ mt: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Job Types" />
                    <Tab label="Equipment Types" />
                    <Tab label="Status Configurations" />
                    <Tab label="System Settings" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                        >
                            Add Job Type
                        </Button>
                    </Box>
                    {renderList(jobTypes)}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                        >
                            Add Equipment Type
                        </Button>
                    </Box>
                    {renderList(equipmentTypes)}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography>Status configuration options will go here</Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Typography>System settings will go here</Typography>
                </TabPanel>
            </Paper>

            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
                <DialogTitle>
                    {editItem ? 'Edit' : 'Add'} {tabValue === 0 ? 'Job Type' : 'Equipment Type'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        defaultValue={editItem?.name}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleSave('New Name')} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
