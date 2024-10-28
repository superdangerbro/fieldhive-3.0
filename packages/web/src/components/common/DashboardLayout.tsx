'use client';

import React from 'react';
import { styled, alpha, Theme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import HandymanIcon from '@mui/icons-material/Handyman';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePathname, useRouter } from 'next/navigation';

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1))',
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })( 
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
      backdropFilter: 'blur(12px)',
      borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mainListItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Accounts', icon: <PeopleIcon />, path: '/accounts' },
  { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Equipment', icon: <LayersIcon />, path: '/equipment' },
  { text: 'Technician', icon: <HandymanIcon />, path: '/technician' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Properties', icon: <LayersIcon />, path: '/properties' } // Added link to Properties page
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isTechnicianPage = pathname === '/technician';

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar
          sx={{
            pr: '24px',
            minHeight: 64,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              background: 'linear-gradient(to right, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FieldHive
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minHeight: 64,
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />
        <List component="nav" sx={{ px: 2, py: 1 }}>
          {mainListItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: pathname === item.path ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  sx: {
                    color: pathname === item.path ? 'text.primary' : 'text.secondary',
                    fontWeight: pathname === item.path ? 500 : 400,
                  }
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            ...(isTechnicianPage ? {
              p: 0,
              overflow: 'hidden',
            } : {
              p: { xs: 2, sm: 4, md: 6 },
              overflow: 'auto',
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
