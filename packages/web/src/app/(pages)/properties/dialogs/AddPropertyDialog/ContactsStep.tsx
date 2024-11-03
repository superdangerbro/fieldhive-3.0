'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Contact } from '../../types';

interface ContactsStepProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  showAddContact: boolean;
  setShowAddContact: (show: boolean) => void;
  fetchContacts: () => void;
}

export const ContactsStep: React.FC<ContactsStepProps> = ({
  contacts,
  setContacts,
  showAddContact,
  setShowAddContact,
  fetchContacts,
}) => {
  // Fetch contacts when component mounts
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        id: `temp-${Date.now()}`,
        name: '',
        email: '',
        phone: '',
        role: '',
        isPrimary: contacts.length === 0,
      },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value,
    };
    setContacts(newContacts);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          Property Contacts
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddContact}
          variant="outlined"
          size="small"
        >
          Add Contact
        </Button>
      </Box>

      {contacts.map((contact, index) => (
        <Box
          key={contact.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Name"
              value={contact.name}
              onChange={(e) => handleContactChange(index, 'name', e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Email"
              value={contact.email}
              onChange={(e) => handleContactChange(index, 'email', e.target.value)}
              fullWidth
              size="small"
              required
              type="email"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone"
              value={contact.phone}
              onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Role"
              value={contact.role}
              onChange={(e) => handleContactChange(index, 'role', e.target.value)}
              fullWidth
              size="small"
            />
          </Box>
          {contacts.length > 1 && (
            <IconButton
              size="small"
              onClick={() => handleRemoveContact(index)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}

      {contacts.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          No contacts added. Click "Add Contact" to add a property contact.
        </Typography>
      )}
    </Box>
  );
};
