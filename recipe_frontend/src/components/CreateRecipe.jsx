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
    Chip,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const CreateRecipe = ({ showNotification, setLoading }) => {
    const [customRecipe, setCustomRecipe] = useState({
        name: '',
        ingredients: [],
        instructions: '',
        is_veg: true,
        is_fav: false
    });
    const [newIngredient, setNewIngredient] = useState('');

    const API_URL = 'http://localhost:8000/api';


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
                name: customRecipe.name,
                items: customRecipe.ingredients,
                instructions: customRecipe.instructions.split('\n').filter(line => line.trim() !== ''),
                is_recipe: true,
                is_veg: customRecipe.is_veg,
                is_fav: customRecipe.is_fav
            };

            if (!recipeData.name || recipeData.items.length === 0 || recipeData.instructions.length === 0) {
                throw new Error('Please fill in all required fields (name, ingredients, and instructions)');
            }

            await axios.post(`${API_URL}/save-recipe`, recipeData);
            showNotification('Recipe saved successfully!', 'success');

            // Reset form
            setCustomRecipe({
                name: '',
                ingredients: [],
                instructions: '',
                is_veg: true,
                is_fav: false
            });
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
                {/* Custom Recipe Creation */}
                <Grid item xs={12}>
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

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={customRecipe.is_veg}
                                        onChange={(e) => setCustomRecipe(prev => ({ ...prev, is_veg: e.target.checked }))}
                                        name="is_veg"
                                    />
                                }
                                label="Vegetarian Recipe"
                                sx={{ mb: 2 }}
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
