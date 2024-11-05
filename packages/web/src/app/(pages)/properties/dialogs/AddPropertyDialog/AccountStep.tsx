'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Divider,
  TextField,
  Button,
  IconButton,
  Collapse,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Account } from '../../../../globalTypes/account';
import AccountSelector from '../../components/AccountSelector';
import { useAccountContacts, useCreateContact, useDeleteContact, useUpdateContact, type Contact } from '../../hooks/useContacts';

interface AccountStepProps {
  selectedAccounts: Account[];
  setSelectedAccounts: (accounts: Account[]) => void;
  accounts: Account[];
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
}

export const AccountStep: React.FC<AccountStepProps> = ({
  selectedAccounts,
  setSelectedAccounts,
  showAddAccount,
  setShowAddAccount,
}) => {
  // Local state for new contacts before they're saved
  const [newContacts, setNewContacts] = useState<Partial<Contact>[]>([]);
  
  // Get existing contacts if an account is selected
  const accountId = selectedAccounts[0]?.account_id;
  const { data: existingContacts = [], isLoading: loadingContacts } = useAccountContacts(accountId);
  
  // Mutations for contact management
  const { mutate: createContact, isPending: isCreating } = useCreateContact();
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact();

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContactsList = [...newContacts];
    newContactsList[index] = {
      ...newContactsList[index],
      [field]: value,
    };
    setNewContacts(newContactsList);
  };

  const handleAddContact = () => {
    setNewContacts([
      ...newContacts,
      {
        name: '',
        email: '',
        phone: '',
        role: '',
        isPrimary: newContacts.length === 0 && existingContacts.length === 0,
      },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    setNewContacts(newContacts.filter((_, i) => i !== index));
  };

  const handleDeleteExistingContact = (contact: Contact) => {
    if (!accountId) return;
    
    deleteContact({ 
      id: contact.id, 
      accountId 
    });
  };

  const isLoading = loadingContacts || isCreating || isDeleting || isUpdating;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Select Accounts
      </Typography>
      
      <AccountSelector
        selectedAccounts={selectedAccounts}
        onChange={(accounts: Account[]) => {
          setSelectedAccounts(accounts);
          setShowAddAccount(accounts.length === 0);
          // Reset new contacts when account selection changes
          setNewContacts([]);
        }}
      />

      <Collapse in={showAddAccount}>
        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Creating a new account requires at least one primary contact
          </Alert>

          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
            Account Details
          </Typography>
          <TextField
            label="Account Name"
            value={selectedAccounts.length === 1 ? selectedAccounts[0].name : ''}
            onChange={(e) => setSelectedAccounts([{ 
              account_id: 'new', 
              name: e.target.value,
              type: 'customer',
              status: 'active'
            }])}
            fullWidth
            size="small"
            required
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Account Contacts
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddContact}
              variant="outlined"
              size="small"
              disabled={isLoading}
            >
              Add Contact
            </Button>
          </Box>

          {/* Existing Contacts */}
          {existingContacts.map((contact: Contact) => (
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
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Name"
                  value={contact.name}
                  onChange={(e) => updateContact({ 
                    id: contact.id, 
                    data: { 
                      name: e.target.value,
                      account_id: accountId 
                    } 
                  })}
                  fullWidth
                  size="small"
                  required
                  disabled={isLoading}
                />
                <TextField
                  label="Email"
                  value={contact.email}
                  onChange={(e) => updateContact({ 
                    id: contact.id, 
                    data: { 
                      email: e.target.value,
                      account_id: accountId 
                    } 
                  })}
                  fullWidth
                  size="small"
                  required
                  type="email"
                  disabled={isLoading}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Phone"
                  value={contact.phone}
                  onChange={(e) => updateContact({ 
                    id: contact.id, 
                    data: { 
                      phone: e.target.value,
                      account_id: accountId 
                    } 
                  })}
                  fullWidth
                  size="small"
                  required
                  disabled={isLoading}
                />
                <TextField
                  label="Role"
                  value={contact.role}
                  onChange={(e) => updateContact({ 
                    id: contact.id, 
                    data: { 
                      role: e.target.value,
                      account_id: accountId 
                    } 
                  })}
                  fullWidth
                  size="small"
                  disabled={isLoading}
                />
              </Box>
              {!contact.isPrimary && (
                <IconButton
                  size="small"
                  onClick={() => handleDeleteExistingContact(contact)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  disabled={isLoading}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              {contact.isPrimary && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Primary Contact
                </Alert>
              )}
            </Box>
          ))}

          {/* New Contacts */}
          {newContacts.map((contact, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Name"
                  value={contact.name || ''}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  fullWidth
                  size="small"
                  required
                  disabled={isLoading}
                />
                <TextField
                  label="Email"
                  value={contact.email || ''}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  fullWidth
                  size="small"
                  required
                  type="email"
                  disabled={isLoading}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Phone"
                  value={contact.phone || ''}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  fullWidth
                  size="small"
                  required
                  disabled={isLoading}
                />
                <TextField
                  label="Role"
                  value={contact.role || ''}
                  onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={isLoading}
                />
              </Box>
              <IconButton
                size="small"
                onClick={() => handleRemoveContact(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                disabled={isLoading}
              >
                <DeleteIcon />
              </IconButton>
              {index === 0 && existingContacts.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Primary Contact
                </Alert>
              )}
            </Box>
          ))}

          {existingContacts.length === 0 && newContacts.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              No contacts added. Click "Add Contact" to add an account contact.
            </Typography>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
