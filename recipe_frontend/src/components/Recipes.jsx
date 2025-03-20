import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Collapse,
    TextField,
    InputAdornment,
    Paper,
    Tab,
    Tabs
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    AddCircle as AddCircleIcon,
    AccessTime as AccessTimeIcon,
    Restaurant as RestaurantIcon
} from '@mui/icons-material';
import axios from 'axios';

const Recipes = ({ showNotification, setLoading }) => {
    const [recipes, setRecipes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [expandedRecipes, setExpandedRecipes] = useState({});
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [recipeType, setRecipeType] = useState(1);
    const [tabValue, setTabValue] = useState(0);

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/get-recipes`);
            setRecipes(response.data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            showNotification('Failed to fetch recipes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (recipeId) => {
        setExpandedRecipes({
            ...expandedRecipes,
            [recipeId]: !expandedRecipes[recipeId]
        });
    };

    const toggleFavorite = async (recipe) => {
        setLoading(true);
        try {
            const updatedRecipe = {
                ...recipe,
                is_fav: !recipe.is_fav
            };

            await axios.post(`${API_URL}/save-recipe`, updatedRecipe);
            fetchRecipes();
            showNotification(`Recipe ${updatedRecipe.is_fav ? 'added to' : 'removed from'} favorites`, 'success');
        } catch (error) {
            console.error('Error updating favorite status:', error);
            showNotification('Failed to update favorite status', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecipeDetails = (recipe) => {
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    };

    const handleGenerateRecipe = async () => {
        setLoading(true);
        setGenerateDialogOpen(false);

        try {
            const response = await axios.post(`${API_URL}/get-recipe`, {
                type: recipeType
            });

            fetchRecipes();
            showNotification('Recipe generated successfully', 'success');
            handleViewRecipeDetails(response.data);
        } catch (error) {
            console.error('Error generating recipe:', error);
            showNotification(error.response?.data?.error || 'Failed to generate recipe', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Filter recipes based on the selected tab
    const displayedRecipes = tabValue === 0
        ? filteredRecipes
        : tabValue === 1
            ? filteredRecipes.filter(recipe => recipe.is_fav)
            : filteredRecipes.filter(recipe => !recipe.is_fav);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Recipes</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setGenerateDialogOpen(true)}
                >
                    Generate Recipe
                </Button>
            </Box>

            <Box mb={4}>
                <TextField
                    fullWidth
                    placeholder="Search recipes..."
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

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="All Recipes" />
                    <Tab label="Favorites" />
                    <Tab label="Regular" />
                </Tabs>
            </Paper>

            {displayedRecipes.length > 0 ? (
                <Grid container spacing={3}>
                    {displayedRecipes.map((recipe) => (
                        <Grid item xs={12} md={6} lg={4} key={recipe._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardHeader
                                    title={recipe.name}
                                    action={
                                        <IconButton onClick={() => toggleFavorite(recipe)}>
                                            {recipe.is_fav ?
                                                <FavoriteIcon color="error" /> :
                                                <FavoriteBorderIcon />
                                            }
                                        </IconButton>
                                    }
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        {recipe.description?.length > 100
                                            ? `${recipe.description.substring(0, 100)}...`
                                            : recipe.description || "No description available"}
                                    </Typography>

                                    <Box mb={2} display="flex" alignItems="center">
                                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {recipe.cooking_time ? `${recipe.cooking_time} mins` : "Time not specified"}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                        {recipe.tags?.map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>

                                    <Typography variant="subtitle2" gutterBottom>
                                        Ingredients Preview:
                                    </Typography>
                                    <Box>
                                        {recipe.ingredients?.slice(0, 3).map((ingredient, index) => (
                                            <Typography key={index} variant="body2" color="text.secondary">
                                                • {ingredient}
                                            </Typography>
                                        ))}
                                        {recipe.ingredients?.length > 3 && (
                                            <Typography variant="body2" color="text.secondary">
                                                ... and {recipe.ingredients.length - 3} more
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                                    <Button
                                        size="small"
                                        onClick={() => toggleExpand(recipe._id)}
                                        endIcon={expandedRecipes[recipe._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    >
                                        {expandedRecipes[recipe._id] ? "Less" : "More"}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleViewRecipeDetails(recipe)}
                                    >
                                        View Full Recipe
                                    </Button>
                                </CardActions>
                                <Collapse in={expandedRecipes[recipe._id]} timeout="auto" unmountOnExit>
                                    <CardContent sx={{ pt: 0 }}>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom>
                                            Instructions Preview:
                                        </Typography>
                                        {recipe.instructions?.slice(0, 2).map((instruction, index) => (
                                            <Typography key={index} variant="body2" color="text.secondary" paragraph>
                                                {index + 1}. {instruction}
                                            </Typography>
                                        ))}
                                        {recipe.instructions?.length > 2 && (
                                            <Typography variant="body2" color="text.secondary">
                                                ... and {recipe.instructions.length - 2} more steps
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="200px"
                    flexDirection="column"
                    sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 3 }}
                >
                    <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No recipes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {searchText
                            ? "Try a different search term"
                            : "Generate your first recipe by clicking the 'Generate Recipe' button"}
                    </Typography>
                </Box>
            )}

            {/* Recipe Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedRecipe && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                {selectedRecipe.name}
                                <IconButton onClick={() => toggleFavorite(selectedRecipe)}>
                                    {selectedRecipe.is_fav ?
                                        <FavoriteIcon color="error" /> :
                                        <FavoriteBorderIcon />
                                    }
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="subtitle1" gutterBottom>
                                Description:
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {selectedRecipe.description || "No description available"}
                            </Typography>

                            <Box mb={3} display="flex" alignItems="center" gap={2}>
                                <Chip
                                    icon={<AccessTimeIcon />}
                                    label={`${selectedRecipe.cooking_time || 'N/A'} mins`}
                                    variant="outlined"
                                />
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {selectedRecipe.tags?.map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" color="primary" />
                                    ))}
                                </Box>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                Ingredients:
                            </Typography>
                            <List dense>
                                {selectedRecipe.ingredients?.map((ingredient, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={ingredient} />
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle1" gutterBottom>
                                Instructions:
                            </Typography>
                            <List>
                                {selectedRecipe.instructions?.map((instruction, index) => (
                                    <ListItem key={index} alignItems="flex-start">
                                        <ListItemText
                                            primary={`Step ${index + 1}`}
                                            secondary={instruction}
                                            secondaryTypographyProps={{ paragraph: true }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            {selectedRecipe.notes && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" gutterBottom>
                                        Notes:
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {selectedRecipe.notes}
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Generate Recipe Dialog */}
            <Dialog
                open={generateDialogOpen}
                onClose={() => setGenerateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Generate New Recipe</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        Choose the type of recipe you want to generate:
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant={recipeType === 1 ? "contained" : "outlined"}
                            sx={{ mr: 2, mb: 1 }}
                            onClick={() => setRecipeType(1)}
                        >
                            Use Available Ingredients
                        </Button>
                        <Button
                            variant={recipeType === 2 ? "contained" : "outlined"}
                            sx={{ mr: 2, mb: 1 }}
                            onClick={() => setRecipeType(2)}
                        >
                            Expiring Ingredients
                        </Button>
                        <Button
                            variant={recipeType === 3 ? "contained" : "outlined"}
                            sx={{ mb: 1 }}
                            onClick={() => setRecipeType(3)}
                        >
                            Random Recipe
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        {recipeType === 1 && "Create a recipe using ingredients you have in your inventory."}
                        {recipeType === 2 && "Create a recipe prioritizing ingredients that are expiring soon."}
                        {recipeType === 3 && "Generate a random recipe without considering your available ingredients."}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleGenerateRecipe}>Generate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Recipes;