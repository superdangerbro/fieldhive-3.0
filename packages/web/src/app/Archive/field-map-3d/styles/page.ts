import { Theme } from '@mui/material';

export const pageStyles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  }
});
