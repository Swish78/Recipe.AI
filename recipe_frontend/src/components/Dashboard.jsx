import { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Kitchen as KitchenIcon,
    Restaurant as RestaurantIcon,
    WarningAmber as WarningIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

const Dashboard = ({ showNotification, setLoading }) => {
    const [ingredients, setIngredients] = useState([]);
    const [expiringIngredients, setExpiringIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [stats, setStats] = useState({
        totalIngredients: 0,
        vegetableCount: 0,
        otherCount: 0,
        recipeCount: 0,
        favoriteCount: 0
    });

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ingredientsRes, expiringRes, recipesRes, suggestionsRes] = await Promise.all([
                axios.get(`${API_URL}/get-ingredients`),
                axios.get(`${API_URL}/get-expiring-ingredients`),
                axios.get(`${API_URL}/get-recipes`),
                axios.get(`${API_URL}/get-recipe-suggestions`)
            ]);

            setIngredients(ingredientsRes.data);
            setExpiringIngredients(expiringRes.data);
            setRecipes(recipesRes.data);
            setSuggestions(Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []);

            // Calculate stats
            const vegetableCount = ingredientsRes.data.filter(i => i.is_vegetable_or_fruit).length;
            const otherCount = ingredientsRes.data.length - vegetableCount;
            const favoriteCount = recipesRes.data.filter(r => r.is_fav).length;

            setStats({
                totalIngredients: ingredientsRes.data.length,
                vegetableCount,
                otherCount,
                recipeCount: recipesRes.data.length,
                favoriteCount
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const pieChartData = [
        { name: 'Vegetables & Fruits', value: stats.vegetableCount },
        { name: 'Other Ingredients', value: stats.otherCount },
    ];

    const recipeChartData = [
        { name: 'Regular Recipes', value: stats.recipeCount - stats.favoriteCount },
        { name: 'Favorite Recipes', value: stats.favoriteCount },
    ];

    const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042'];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <KitchenIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                                <Typography variant="h6">Total Ingredients</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                {stats.totalIngredients}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <RestaurantIcon color="secondary" sx={{ fontSize: 30, mr: 1 }} />
                                <Typography variant="h6">Total Recipes</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                {stats.recipeCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <WarningIcon sx={{ color: 'warning.dark', fontSize: 30, mr: 1 }} />
                                <Typography variant="h6" sx={{ color: 'warning.dark' }}>Expiring Soon</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center', color: 'warning.dark' }}>
                                {expiringIngredients.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Ingredients Breakdown</Typography>
                            <Box sx={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                                {stats.totalIngredients > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                        <Typography variant="subtitle1" color="text.secondary">No data available</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Expiring Ingredients */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Expiring Ingredients</Typography>
                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {expiringIngredients.length > 0 ? (
                                    <List>
                                        {expiringIngredients.map((item, index) => (
                                            <div key={item._id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={item.name}
                                                        secondary={`Quantity: ${item.quantity} • Added: ${new Date(item.itemAdded).toLocaleDateString()}`}
                                                    />
                                                </ListItem>
                                                {index < expiringIngredients.length - 1 && <Divider />}
                                            </div>
                                        ))}
                                    </List>
                                ) : (
                                    <Box display="flex" alignItems="center" justifyContent="center" height={100}>
                                        <Typography variant="subtitle1" color="text.secondary">No expiring ingredients</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recipe Suggestions */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Recipe Suggestions</Typography>
                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {suggestions.length > 0 ? (
                                    <List>
                                        {suggestions.map((suggestion, index) => (
                                            <div key={index}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={suggestion.name}
                                                        secondary={suggestion.description}
                                                    />
                                                </ListItem>
                                                {index < suggestions.length - 1 && <Divider />}
                                            </div>
                                        ))}
                                    </List>
                                ) : (
                                    <Box display="flex" alignItems="center" justifyContent="center" height={100}>
                                        <Typography variant="subtitle1" color="text.secondary">No suggestions available</Typography>
                                    </Box>
                                )}
                            </Box>
                            <Box mt={2} display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => fetchDashboardData()}
                                >
                                    Refresh Suggestions
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;