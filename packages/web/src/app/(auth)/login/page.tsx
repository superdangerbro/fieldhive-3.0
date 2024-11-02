'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <Card sx={{ width: '100%', maxWidth: 400, mx: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom textAlign="center">
          Login to FieldHive
        </Typography>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
