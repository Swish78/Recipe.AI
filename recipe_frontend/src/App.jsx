import { useState, useEffect } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Kitchen as KitchenIcon,
    Restaurant as RestaurantIcon,
    Receipt as ReceiptIcon,
    Dashboard as DashboardIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import Dashboard from './components/Dashboard';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import CreateRecipe from './components/CreateRecipe';
import UploadInvoice from './components/UploadInvoice';
import FavoriteRecipes from './components/FavoriteRecipes';

const App = () => {
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: darkMode ? '#90caf9' : '#1976d2',
            },
            secondary: {
                main: darkMode ? '#f48fb1' : '#dc004e',
            },
            background: {
                default: darkMode ? '#121212' : '#f5f5f5',
                paper: darkMode ? '#1e1e1e' : '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
            h4: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: darkMode ? '0 8px 40px -12px rgba(0,0,0,0.5)' : '0 8px 40px -12px rgba(0,0,0,0.3)',
                        transition: 'box-shadow 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: darkMode ? '0 16px 70px -12px rgba(0,0,0,0.6)' : '0 16px 70px -12px rgba(0,0,0,0.3)',
                        },
                    },
                },
            },
        },
    });

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleNavigation = (page) => {
        setCurrentPage(page);
        setDrawerOpen(false);
    };

    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false,
        });
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard showNotification={showNotification} setLoading={setLoading} />;
            case 'ingredients':
                return <Ingredients showNotification={showNotification} setLoading={setLoading} />;
            case 'recipes':
                return <Recipes showNotification={showNotification} setLoading={setLoading} />;
            case 'createRecipe':
                return <CreateRecipe showNotification={showNotification} setLoading={setLoading} />;
            case 'uploadInvoice':
                return <UploadInvoice showNotification={showNotification} setLoading={setLoading} />;
            case 'favorites':
                return <FavoriteRecipes showNotification={showNotification} setLoading={setLoading} />;
            default:
                return <Dashboard showNotification={showNotification} setLoading={setLoading} />;
        }
    };

    const drawerItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
        { text: 'Ingredients', icon: <KitchenIcon />, page: 'ingredients' },
        { text: 'Recipes', icon: <RestaurantIcon />, page: 'recipes' },
        { text: 'Create Recipe', icon: <RestaurantIcon />, page: 'createRecipe' },
        { text: 'Upload Invoice', icon: <ReceiptIcon />, page: 'uploadInvoice' },
        { text: 'Favorite Recipes', icon: <FavoriteIcon />, page: 'favorites' },
    ];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={toggleDrawer(true)}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            Recipe AI
                        </Typography>
                        <IconButton color="inherit" onClick={toggleDarkMode}>
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                    <Box
                        sx={{ width: 250 }}
                        role="presentation"
                    >
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                Recipe AI
                            </Typography>
                        </Box>
                        <Divider />
                        <List>
                            {drawerItems.map((item) => (
                                <ListItem
                                    button
                                    key={item.text}
                                    onClick={() => handleNavigation(item.page)}
                                    sx={{
                                        bgcolor: currentPage === item.page ? (darkMode ? 'rgba(144, 202, 249, 0.15)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
                                        borderRadius: 1,
                                        mx: 1,
                                        width: 'calc(100% - 16px)',
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        pt: { xs: 10, sm: 12 },
                        pb: 4,
                        px: { xs: 2, sm: 4 },
                        position: 'relative',
                    }}
                >
                    <Container maxWidth="lg">
                        {renderPage()}
                    </Container>
                </Box>
            </Box>
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress color="primary" size={60} />
                </Box>
            )}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default App;