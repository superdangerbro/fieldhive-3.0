'use client';
import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Collapse, ButtonBase } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkIcon from '@mui/icons-material/Work';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

const menuItems = [
  { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
  { text: 'Properties', icon: <BusinessIcon />, path: '/properties' },
  { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
  { text: 'Field Map', icon: <MapIcon />, path: '/field-map' },
  { text: 'Field Map 3D', icon: <MapIcon />, path: '/field-map-3d' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const renderMenuItem = (item: any, isSubItem = false) => {
    const isSelected = pathname === item.path;

    return (
      <Link key={item.text} href={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
        <ListItem 
          sx={{ 
            pl: isSubItem ? 4 : 2,
            backgroundColor: isSelected ? 'action.selected' : 'transparent'
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          {isDrawerOpen && <ListItemText primary={item.text} />}
        </ListItem>
      </Link>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
          >
            {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            FieldHive
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={isDrawerOpen}
        sx={{
          width: isDrawerOpen ? drawerWidth : 64,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isDrawerOpen ? drawerWidth : 64,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => renderMenuItem(item))}
          </List>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'auto',
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
          pt: (theme) => `${theme.mixins.toolbar.minHeight}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
