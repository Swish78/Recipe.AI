import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Paper
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Favorite as FavoriteIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';

const FavoriteRecipes = ({ showNotification, setLoading }) => {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        fetchFavoriteRecipes();
    }, []);

    const fetchFavoriteRecipes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/get-recipes`);
            const favorites = response.data.filter(recipe => recipe.is_fav);
            setFavoriteRecipes(favorites);
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
            showNotification('Failed to fetch favorite recipes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecipeDetails = (recipe) => {
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    };

    const confirmDeleteRecipe = (recipe) => {
        setRecipeToDelete(recipe);
        setDeleteDialogOpen(true);
    };

    const handleDeleteRecipe = async () => {
        if (!recipeToDelete) return;

        setLoading(true);
        try {
            const updatedRecipe = {
                ...recipeToDelete,
                is_fav: false
            };

            await axios.post(`${API_URL}/save-recipe`, updatedRecipe);

            setDeleteDialogOpen(false);
            fetchFavoriteRecipes();
            showNotification('Recipe removed from favorites', 'success');
        } catch (error) {
            console.error('Error removing recipe from favorites:', error);
            showNotification('Failed to remove recipe from favorites', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecipes = favoriteRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Favorite Recipes</Typography>
            </Box>

            <Box mb={4}>
                <TextField
                    fullWidth
                    placeholder="Search favorite recipes..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchText && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchText('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {filteredRecipes.length > 0 ? (
                <Grid container spacing={3}>
                    {filteredRecipes.map((recipe) => (
                        <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" noWrap>
                                            {recipe.name}
                                        </Typography>
                                        <FavoriteIcon color="error" />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {recipe.description || 'No description available.'}
                                    </Typography>

                                    <Typography variant="subtitle2" gutterBottom>
                                        Ingredients:
                                    </Typography>
                                    <Box sx={{ mb: 1, maxHeight: 100, overflow: 'hidden' }}>
                                        {recipe.ingredients && recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                                            <Chip
                                                key={idx}
                                                label={ingredient}
                                                size="small"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                        ))}
                                        {recipe.ingredients && recipe.ingredients.length > 3 && (
                                            <Chip
                                                label={`+${recipe.ingredients.length - 3} more`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mb: 0.5 }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleViewRecipeDetails(recipe)}
                                    >
                                        View Details
                                    </Button>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => confirmDeleteRecipe(recipe)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No favorite recipes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchText ? 'Try a different search term' : 'Add recipes to your favorites to see them here'}
                    </Typography>
                </Paper>
            )}

            {/* Recipe Details Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                {selectedRecipe && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{selectedRecipe.name}</Typography>
                                <FavoriteIcon color="error" />
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            {selectedRecipe.description && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom>Description:</Typography>
                                    <Typography variant="body1" paragraph>
                                        {selectedRecipe.description}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                </>
                            )}

                            <Typography variant="subtitle1" gutterBottom>Ingredients:</Typography>
                            <List dense>
                                {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={ingredient} />
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle1" gutterBottom>Instructions:</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                {selectedRecipe.instructions}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Remove from Favorites</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{recipeToDelete?.name}" from your favorites?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteRecipe} color="error" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FavoriteRecipes;