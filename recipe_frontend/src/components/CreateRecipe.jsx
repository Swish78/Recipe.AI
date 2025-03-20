import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Paper,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const CreateRecipe = ({ showNotification, setLoading }) => {
    const [recipeType, setRecipeType] = useState(1);
    const [customRecipe, setCustomRecipe] = useState({
        name: '',
        ingredients: [],
        instructions: '',
        description: ''
    });
    const [newIngredient, setNewIngredient] = useState('');
    const [generatedRecipe, setGeneratedRecipe] = useState(null);

    const API_URL = 'http://localhost:8000/api';

    const handleTypeChange = (e) => {
        setRecipeType(e.target.value);
    };

    const handleCustomRecipeChange = (e) => {
        const { name, value } = e.target;
        setCustomRecipe({
            ...customRecipe,
            [name]: value
        });
    };

    const handleAddIngredient = () => {
        if (newIngredient.trim()) {
            setCustomRecipe({
                ...customRecipe,
                ingredients: [...customRecipe.ingredients, newIngredient.trim()]
            });
            setNewIngredient('');
        }
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = [...customRecipe.ingredients];
        updatedIngredients.splice(index, 1);
        setCustomRecipe({
            ...customRecipe,
            ingredients: updatedIngredients
        });
    };

    const generateRecipe = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/get-recipe`, {
                type: recipeType
            });
            setGeneratedRecipe(response.data);
            showNotification('Recipe generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating recipe:', error);
            showNotification('Failed to generate recipe. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveCustomRecipe = async () => {
        if (!customRecipe.name.trim()) {
            showNotification('Please enter a recipe name', 'warning');
            return;
        }

        if (customRecipe.ingredients.length === 0) {
            showNotification('Please add at least one ingredient', 'warning');
            return;
        }

        if (!customRecipe.instructions.trim()) {
            showNotification('Please add cooking instructions', 'warning');
            return;
        }

        setLoading(true);
        try {
            const recipeData = {
                ...customRecipe,
                is_recipe: true,
                is_fav: true
            };

            await axios.post(`${API_URL}/save-recipe`, recipeData);
            showNotification('Recipe saved successfully!', 'success');

            // Reset form
            setCustomRecipe({
                name: '',
                ingredients: [],
                instructions: '',
                description: ''
            });
        } catch (error) {
            console.error('Error saving recipe:', error);
            showNotification('Failed to save recipe', 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveGeneratedRecipe = async () => {
        if (!generatedRecipe) return;

        setLoading(true);
        try {
            await axios.post(`${API_URL}/save-recipe`, {
                ...generatedRecipe,
                is_fav: true
            });
            showNotification('Recipe saved to favorites!', 'success');
        } catch (error) {
            console.error('Error saving recipe:', error);
            showNotification('Failed to save recipe', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Create Recipe
            </Typography>

            <Grid container spacing={3}>
                {/* AI Recipe Generation */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Generate Recipe with AI
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="recipe-type-label">Recipe Type</InputLabel>
                                <Select
                                    labelId="recipe-type-label"
                                    id="recipe-type"
                                    value={recipeType}
                                    label="Recipe Type"
                                    onChange={handleTypeChange}
                                >
                                    <MenuItem value={1}>Use Available Ingredients</MenuItem>
                                    <MenuItem value={2}>Optimize for Expiring Ingredients</MenuItem>
                                    <MenuItem value={3}>Surprise Me</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={generateRecipe}
                            >
                                Generate Recipe
                            </Button>

                            {generatedRecipe && (
                                <Box mt={3}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="h6" color="primary">{generatedRecipe.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                            {generatedRecipe.description}
                                        </Typography>

                                        <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Ingredients:</Typography>
                                        <List dense>
                                            {generatedRecipe.ingredients.map((ingredient, index) => (
                                                <ListItem key={index} dense>
                                                    <ListItemText primary={ingredient} />
                                                </ListItem>
                                            ))}
                                        </List>

                                        <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Instructions:</Typography>
                                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                                            {generatedRecipe.instructions}
                                        </Typography>

                                        <Box mt={2} display="flex" justifyContent="flex-end">
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={saveGeneratedRecipe}
                                            >
                                                Save to Favorites
                                            </Button>
                                        </Box>
                                    </Paper>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Custom Recipe Creation */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Create Custom Recipe
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <TextField
                                fullWidth
                                label="Recipe Name"
                                name="name"
                                value={customRecipe.name}
                                onChange={handleCustomRecipeChange}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="Description (Optional)"
                                name="description"
                                value={customRecipe.description}
                                onChange={handleCustomRecipeChange}
                                margin="normal"
                                multiline
                                rows={2}
                            />

                            <Box mt={2} mb={2}>
                                <Typography variant="subtitle2" gutterBottom>Ingredients</Typography>
                                <Box display="flex">
                                    <TextField
                                        fullWidth
                                        label="Add Ingredient"
                                        value={newIngredient}
                                        onChange={(e) => setNewIngredient(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ ml: 1 }}
                                        onClick={handleAddIngredient}
                                    >
                                        <AddIcon />
                                    </Button>
                                </Box>

                                <Box mt={2} sx={{ maxHeight: 150, overflow: 'auto' }}>
                                    {customRecipe.ingredients.length > 0 ? (
                                        <List dense>
                                            {customRecipe.ingredients.map((ingredient, index) => (
                                                <ListItem
                                                    key={index}
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            onClick={() => handleRemoveIngredient(index)}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <Chip label={ingredient} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                            No ingredients added yet
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Cooking Instructions"
                                name="instructions"
                                value={customRecipe.instructions}
                                onChange={handleCustomRecipeChange}
                                margin="normal"
                                multiline
                                rows={6}
                            />

                            <Box mt={3} display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={saveCustomRecipe}
                                >
                                    Save Recipe
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CreateRecipe;