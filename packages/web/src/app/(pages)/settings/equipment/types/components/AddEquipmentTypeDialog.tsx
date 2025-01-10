import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { SelectFieldDialog } from '@/app/components/fields/SelectFieldDialog';
import type { FormField } from './types';

interface AddEquipmentTypeDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (type: { name: string; description: string; fields: FormField[] }) => void;
}

export function AddEquipmentTypeDialog({ open, onClose, onAdd }: AddEquipmentTypeDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [isSelectingField, setIsSelectingField] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            description,
            fields
        });
        // Reset form
        setName('');
        setDescription('');
        setFields([]);
    };

    const handleAddField = (field: FormField) => {
        setFields(prev => [...prev, field]);
    };

    const handleRemoveField = (fieldName: string) => {
        setFields(prev => prev.filter(f => f.name !== fieldName));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Equipment Type</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Type Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            Fields
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => setIsSelectingField(true)}
                                size="small"
                            >
                                Add Field
                            </Button>
                        </Typography>

                        <List>
                            {fields.map((field) => (
                                <ListItem key={field.name} divider>
                                    <ListItemText
                                        primary={field.label}
                                        secondary={`${field.type} - ${field.description || 'No description'}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveField(field.name)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!name || fields.length === 0}>
                    Add Type
                </Button>
            </DialogActions>

            <SelectFieldDialog
                open={isSelectingField}
                onClose={() => setIsSelectingField(false)}
                onSelect={handleAddField}
                existingFieldNames={fields.map(f => f.name)}
            />
        </Dialog>
    );
}
