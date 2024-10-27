import { createTheme, Theme, Components } from '@mui/material';
import { dataGridStyles } from '../styles/dataGrid';

declare module '@mui/material/styles' {
    interface Components {
        MuiDataGrid?: {
            styleOverrides?: {
                root?: any;
            };
        };
    }
}

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5'
        },
        secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777'
        },
        background: {
            default: '#0f172a',
            paper: '#1e293b'
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8'
        },
        error: {
            main: '#ef4444'
        },
        warning: {
            main: '#f59e0b'
        },
        info: {
            main: '#3b82f6'
        },
        success: {
            main: '#10b981'
        },
        divider: 'rgba(148, 163, 184, 0.12)'
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
            letterSpacing: '-0.02em'
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5
        }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: '#1e293b #0f172a',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px'
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: '#1e293b',
                        border: '2px solid #0f172a'
                    },
                    '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                        backgroundColor: '#0f172a'
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500
                },
                contained: {
                    backgroundImage: 'linear-gradient(to bottom right, #6366f1, #4f46e5)',
                    '&:hover': {
                        backgroundImage: 'linear-gradient(to bottom right, #4f46e5, #4338ca)'
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 12,
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined'
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)'
                    }
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    borderRadius: 8
                },
                listbox: {
                    padding: 4,
                    '& .MuiAutocomplete-option': {
                        borderRadius: 4,
                        margin: '2px 4px'
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6
                },
                colorSuccess: {
                    backgroundImage: 'linear-gradient(to right, #059669, #10b981)'
                },
                colorError: {
                    backgroundImage: 'linear-gradient(to right, #dc2626, #ef4444)'
                }
            }
        },
        MuiDataGrid: {
            styleOverrides: {
                root: dataGridStyles
            }
        }
    },
    shape: {
        borderRadius: 8
    }
});
