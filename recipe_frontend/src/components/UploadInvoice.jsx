import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    Divider,
    Paper,
    Alert,
    AlertTitle,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const UploadInvoice = ({ showNotification, setLoading }) => {
    const [file, setFile] = useState(null);
    const [fileSelected, setFileSelected] = useState(false);
    const [extractedItems, setExtractedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, loading, success, error

    const API_URL = 'http://localhost:8000/api';

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileSelected(true);
            setUploadStatus('idle');
            setExtractedItems([]);
            setSelectedItems({});
        } else if (selectedFile) {
            showNotification('Please upload a PDF file', 'error');
            setFile(null);
            setFileSelected(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showNotification('Please select a file to upload', 'warning');
            return;
        }

        setLoading(true);
        setUploadStatus('loading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/upload-invoice`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const items = response.data.items || [];
            setExtractedItems(items);

            // Initialize all items as selected
            const initialSelectedState = {};
            items.forEach(item => {
                initialSelectedState[item.id || item.name] = true;
            });
            setSelectedItems(initialSelectedState);

            setUploadStatus('success');
            showNotification('Invoice processed successfully', 'success');
        } catch (error) {
            console.error('Error uploading invoice:', error);
            setUploadStatus('error');
            showNotification('Failed to process invoice', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems({
            ...selectedItems,
            [itemId]: !selectedItems[itemId]
        });
    };

    const handleAddToInventory = async () => {
        const selectedItemsList = extractedItems.filter(
            item => selectedItems[item.id || item.name]
        );

        if (selectedItemsList.length === 0) {
            showNotification('Please select at least one item', 'warning');
            return;
        }

        setLoading(true);
        try {
            // Add each selected item to inventory
            for (const item of selectedItemsList) {
                await axios.post(`${API_URL}/add-ingredient`, {
                    name: item.name,
                    quantity: item.quantity || 1,
                    is_vegetable_or_fruit: item.category === 'vegetable' || item.category === 'fruit'
                });
            }

            showNotification('Items added to inventory successfully', 'success');

            // Reset form
            setFile(null);
            setFileSelected(false);
            setExtractedItems([]);
            setSelectedItems({});
            setUploadStatus('idle');
        } catch (error) {
            console.error('Error adding items to inventory:', error);
            showNotification('Failed to add items to inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Upload Invoice
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upload Receipt or Invoice
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'action.hover'
                                    }
                                }}
                                onClick={() => document.getElementById('invoice-upload').click()}
                            >
                                <input
                                    type="file"
                                    id="invoice-upload"
                                    style={{ display: 'none' }}
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="body1" gutterBottom>
                                    Click to upload or drag and drop
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Supported format: PDF
                                </Typography>

                                {fileSelected && (
                                    <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                                        <AlertTitle>Selected File</AlertTitle>
                                        {file.name}
                                    </Alert>
                                )}
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                                onClick={handleUpload}
                                disabled={!fileSelected || uploadStatus === 'loading'}
                            >
                                Process Invoice
                            </Button>

                            {uploadStatus === 'error' && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    <AlertTitle>Error</AlertTitle>
                                    Failed to process the invoice. Please try again or check the file format.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Extracted Items
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {uploadStatus === 'success' && extractedItems.length > 0 ? (
                                <>
                                    <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto', mb: 3 }}>
                                        <List dense>
                                            {extractedItems.map((item, index) => (
                                                <ListItem key={index} divider={index < extractedItems.length - 1}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={!!selectedItems[item.id || item.name]}
                                                                onChange={() => toggleItemSelection(item.id || item.name)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="subtitle1">{item.name}</Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Quantity: {item.quantity || 1}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        sx={{ width: '100%', margin: 0 }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<CheckIcon />}
                                        onClick={handleAddToInventory}
                                    >
                                        Add Selected Items to Inventory
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {uploadStatus === 'loading'
                                            ? 'Processing invoice...'
                                            : 'Upload and process an invoice to see extracted items here'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UploadInvoice;
