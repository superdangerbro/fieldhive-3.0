import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
  Collapse,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Account, Contact } from '../types';

interface AccountStepProps {
  selectedAccounts: Account[];
  setSelectedAccounts: (accounts: Account[]) => void;
  accounts: Account[];
  showAddAccount: boolean;
  setShowAddAccount: (show: boolean) => void;
  fetchAccounts: () => Promise<void>;
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

export const AccountStep: React.FC<AccountStepProps> = ({
  selectedAccounts,
  setSelectedAccounts,
  accounts,
  showAddAccount,
  setShowAddAccount,
  fetchAccounts,
  contacts,
  setContacts,
}) => {
  // Fetch accounts when component mounts
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Select Accounts
      </Typography>
      <Autocomplete
        multiple
        value={selectedAccounts}
        onChange={(_, newValue) => {
          setSelectedAccounts(newValue);
          setShowAddAccount(newValue.length === 0);
        }}
        options={accounts}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={accounts.length === 0}
        loadingText="Loading accounts..."
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option.name}
              {...getTagProps({ index })}
              key={option.id}
            />
          ))
        }
        noOptionsText={
          <Button 
            onClick={() => setShowAddAccount(true)}
            startIcon={<AddIcon />}
            fullWidth
          >
            Create New Account
          </Button>
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Accounts"
            size="small"
            fullWidth
            placeholder={selectedAccounts.length === 0 ? "Select accounts" : ""}
          />
        )}
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
              id: 'new', 
              name: e.target.value 
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
                mb: 2,
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
              {contacts.length > 1 && !contact.isPrimary && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveContact(index)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
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

          {contacts.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
              No contacts added. Click "Add Contact" to add an account contact.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
