'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  TextField,
  Grid,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Link from 'next/link';

// Firebase imports
import { firestore, auth } from './firebase'; // Ensure auth is imported
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  where, // Import where for querying specific user's items
} from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Pantry() {
  // Utility function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    date: getTodayDate(), // Initialize with today's date
    qty: '',
  });
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [editItemId, setEditItemId] = useState(null);
  const [editItem, setEditItem] = useState({
    name: '',
    category: '',
    date: '',
    qty: '',
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false); // State for filter dialog
  const [filterCriteria, setFilterCriteria] = useState({
    name: '',
    category: '',
    date: '',
    qty: '',
  }); // State for filter criteria
  const [filteredItems, setFilteredItems] = useState([]); // State for filtered items
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for confirm delete dialog
  const [itemToDelete, setItemToDelete] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const router = useRouter();

  const category = [
    'Fruits',
    'Vegetables',
    'Pets',
    'Fresh Meat',
    'Stationary',
    'Dairy',
    'Bakery',
    'Snacks',
    'Frozen Food',
    'Other',
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch user-specific items
        const q = query(
          collection(firestore, 'users', user.uid, 'inventory') // Correct path to the user's inventory
        );

        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
          let itemsArr = [];
          querySnapshot.forEach((doc) => {
            itemsArr.push({ ...doc.data(), id: doc.id });
          });
          setItems(itemsArr);
          setFilteredItems(itemsArr); // Initialize filtered items with all items
        });

        return () => unsubscribeFirestore(); // Cleanup the snapshot listener
      } else {
        // If not logged in, redirect to login page
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);

  const checkRepeat = (n) => {
    for (const item of items) {
      if (n.toLowerCase() === item.name.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  // Add item to user-specific subcollection
  const addItem = async (e) => {
    e.preventDefault();

    const user = auth.currentUser; // Get current user

    if (user) {
      if (checkRepeat(newItem.name)) {
        setErrorMessage('Item already present in pantry. You may increase or decrease the quantity.');
        return;
      }
      // Check if the name length is valid
      if (newItem.name.length === 0) {
        setErrorMessage('Please enter the item name');
        return;
      }

      if (newItem.name.length >= 40) {
        setErrorMessage('Length of name must be less than 40 characters');
        return;
      }

      if (newItem.category.length === 0) {
        setErrorMessage('Please select a category');
        return;
      }

      // Convert selected date to Date object
      const selectedDate = new Date(newItem.date);

      // Get today's date without time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if the selected date is greater than or equal to today
      if (selectedDate < today) {
        setErrorMessage(
          'Expiration date should either be today or later than today'
        );
        return;
      }

      if (newItem.qty === '') {
        setErrorMessage('Please enter the quantity');
        return;
      }

      if (isNaN(parseFloat(newItem.qty)) || newItem.qty <= 0) {
        setErrorMessage('Quantity must be a positive number');
        return;
      }

      // Check if all fields are filled
      if (
        newItem.name !== '' &&
        newItem.category !== '' &&
        newItem.qty !== ''
      ) {
        try {
          // Reference to the user's subcollection
          const userItemsCollection = collection(
            firestore,
            'users',
            user.uid,
            'inventory'
          );

          await addDoc(userItemsCollection, {
            name: newItem.name.trim(),
            category: newItem.category.trim(),
            date: newItem.date,
            qty: newItem.qty,
          });

          setConfirmationMessage(
            `${newItem.name.charAt(0).toUpperCase() + newItem.name.slice(1)} has been successfully added.`
          );
          setNewItem({ name: '', category: '', date: getTodayDate(), qty: '' }); // Reset date to today after adding
          setErrorMessage(''); // Clear error message after successful add
        } catch (error) {
          console.error('Error adding document:', error);
          setErrorMessage('An error occurred while adding the item. Please try again.');
          setConfirmationMessage('');
        }
      } else {
        setErrorMessage('User not logged in. Please log in to add items.');
      }
    }
  };

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(firestore, 'users', auth.currentUser.uid, 'inventory', id));
  };

  // Enter edit mode for a specific item
  const enterEditMode = (item) => {
    setEditItemId(item.id);
    setEditItem({
      name: item.name,
      category: item.category,
      date: item.date,
      qty: item.qty,
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditItemId(null);
    setEditItem({ name: '', category: '', date: '', qty: '' });
  };

  // Update item in Firestore
  const updateItem = async (id) => {
    try {
      const itemRef = doc(firestore, 'users', auth.currentUser.uid, 'inventory', id);
      await updateDoc(itemRef, {
        name: editItem.name.trim(),
        category: editItem.category.trim(),
        date: editItem.date,
        qty: editItem.qty,
      });
      setEditItemId(null);
      setEditItem({ name: '', category: '', date: '', qty: '' });
    } catch (error) {
      console.error('Error updating document:', error);
      setErrorMessage(
        'An error occurred while updating the item. Please try again.'
      );
    }
  };

  // Open filter dialog
  const openFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  // Close filter dialog
  const closeFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  // Apply filter
  const applyFilter = () => {
    const filtered = items.filter((item) => {
      const matchesName = item.name
        .toLowerCase()
        .includes(filterCriteria.name.toLowerCase());
      const matchesCategory = item.category
        .toLowerCase()
        .includes(filterCriteria.category.toLowerCase());
      const matchesDate = filterCriteria.date
        ? item.date === filterCriteria.date
        : true;
      const matchesQty = filterCriteria.qty
        ? item.qty === filterCriteria.qty
        : true;

      return matchesName && matchesCategory && matchesDate && matchesQty;
    });

    setFilteredItems(filtered);
    closeFilterDialog();
  };

  const removeFilter = () => {
    setFilteredItems(items);
    closeFilterDialog();
  };

  // Confirm Delete
  const openDeleteDialog = (i) => {
    setItemToDelete(i);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setDeleteDialogOpen(false); // Close the dialog after deletion
      await deleteItem(itemToDelete.id); // Call the delete function with the ID
      setItemToDelete(null); // Clear the ID after deletion
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to the homepage or login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Failed to log out. Please try again.');
    }
  };

  return (
    <Box width="100vw" height="100vh" bgcolor={'#1A4D2E'} color={'#1A4D2E'}>
      <AppBar position="static" sx={{ bgcolor: '#0A0736' }}>
        <Toolbar>

          <Typography variant="h5" style={{ flexGrow: 1 }} textAlign={'center'}>
            Pantry Tracker
          </Typography>
          <Link href={'/'} passHref>
            <Button variant="h5" sx={{ color: 'orangered' }} onClick={handleLogout} >
              Logout
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Box height={'calc(100vh - 64px)'} width={'100%'} display={'flex'}>
        {/*Adding box*/}
        <Box
          id="adding-box"
          height="100%"
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          borderRight={'1px solid black'}
          width="40%"
        >
          <Box
            id="adding-container"
            width="500px"
            padding="20px"
            height="auto"
            bgcolor="#E8DFCA"
            borderRadius={'10px'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Typography
              color={'#1A4D2E'}
              variant="h3"
              width="72%"
              borderBottom={'3px solid #1A4D2E'}
              textAlign={'center'}
            >
              <b>ADD ITEMS</b>
            </Typography>

            <form onSubmit={addItem}>

              <Box
                height="auto"
                py="10px"
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'space-between'}
              >
                <TextField
                  id="name"
                  label="Item Name"
                  variant="outlined"
                  value={newItem.name}
                  sx={{ width: 400, mb: 2 }}
                  onChange={(e) => {
                    setNewItem({ ...newItem, name: e.target.value });
                    setErrorMessage('');
                    setConfirmationMessage('');
                  }}
                />

                <Autocomplete
                  disablePortal
                  id="category"
                  options={category}
                  value={newItem.category || null}
                  sx={{ width: 400, mb: 2 }}
                  onChange={(event, newValue) => {
                    setNewItem({ ...newItem, category: newValue });
                    setErrorMessage('');
                    setConfirmationMessage('');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" />
                  )}
                />

                <TextField
                  type="date"
                  id="expiration-date"
                  label="Expiration Date"
                  variant="outlined"
                  sx={{ width: 400, mb: 2 }}
                  value={newItem.date}
                  onChange={(e) => {
                    setNewItem({ ...newItem, date: e.target.value });
                    setErrorMessage('');
                    setConfirmationMessage('');
                  }

                  }
                  InputLabelProps={{
                    shrink: true, // Ensure the label is always above the input
                  }}
                  inputProps={{
                    placeholder: '', // Remove default placeholder
                  }}
                />
                <TextField
                  type="number"
                  id="qty"
                  label="Quantity"
                  variant="outlined"
                  value={newItem.qty}
                  sx={{ width: 400, mb: 3 }}
                  onChange={(e) => {
                    setNewItem({ ...newItem, qty: e.target.value });
                    setErrorMessage('');
                    setConfirmationMessage('');
                  }}
                />
                <Button
                  type="submit" // Ensure this is a submit button
                  sx={{
                    backgroundColor: 'orangered',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#4F6F52',
                    },
                  }}
                >
                  Add Item{' '}
                </Button>
              </Box>
            </form>

            {/* Error Message Display */}
            {errorMessage ? (
              <Box
                bgcolor="#e57373"
                color="#721c24"
                px={2}
                py={1}
                borderRadius={1}
                textAlign="center"
                mt="4px"
                maxWidth={'90%'}
              >
                <Typography variant="body1">
                  <b>{errorMessage}</b>
                </Typography>
              </Box>
            ) : confirmationMessage ? (
              <Box
                bgcolor="#77dd77"
                color="#1A4D2E"
                px={2}
                py={1}
                borderRadius={1}
                textAlign="center"
                mt="4px"
                maxWidth={'90%'}
              >
                <Typography variant="body1">{confirmationMessage}</Typography>
              </Box>
            ) : confirmationMessage === '' ? null : null}
          </Box>
        </Box>

        {/*Pantry box*/}
        <Box
          id="pantry-box"
          maxHeight="100%"
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          width="60%"
        >
          <Box
            id="pantry-container"
            width="90%"
            padding="20px"
            height="auto"
            maxHeight="85%"
            bgcolor="#E8DFCA"
            borderRadius={'10px'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Typography
              variant="h3"
              width="45%"
              borderBottom={'3px solid #1A4D2E'}
              textAlign={'center'}
            >
              <b>YOUR PANTRY</b>
            </Typography>

            {/* Adding filter and column names */}
            <Grid container spacing={2} px={'5px'} my={'5px'} textAlign={'center'}>
              <Grid item xs={3}>
                <Typography>
                  <b>Item Name</b>
                </Typography>
              </Grid>
              <Grid item xs={2.8}>
                <Typography>
                  <b>Category</b>
                </Typography>
              </Grid>
              <Grid item xs={2.1}>
                <Typography>
                  <b>Expiration Date</b>
                </Typography>
              </Grid>
              <Grid item xs={1.6}>
                <Typography>
                  <b>Quantity</b>
                </Typography>
              </Grid>
              <Grid item xs={2.2}>
                <IconButton onClick={openFilterDialog}>
                  <FilterAltIcon fontSize="large" sx={{ color: 'orangered' }} />
                </IconButton>
                <IconButton onClick={removeFilter}>
                  <FilterAltOffIcon
                    fontSize="large"
                    sx={{ color: 'orangered' }}
                  ></FilterAltOffIcon>
                </IconButton>
              </Grid>
            </Grid>

            {/* Content */}

            <Stack
              width="100%"
              height="auto"
              maxHeight={'90%'}
              overflow="scroll"
              display={'flex'}
              justifyContent={'space-between'}
              px="3px"
            >
              <Grid container spacing={2} my="0.1px" px={'5px'}>
                {filteredItems.map((i, index) => (
                  <Grid
                    container
                    key={i.id}
                    alignItems="center"
                    p={'10px'}
                    mb={'1px'}
                    borderTop={'3px solid #e57373'}
                  >
                    {editItemId === i.id ? (
                      <>
                        <Grid item xs={3}>
                          <TextField
                            sx={{
                              width: '100',
                              mx: '5px',
                            }}
                            label="Item Name"
                            variant="outlined"
                            value={editItem.name}
                            onChange={(e) =>
                              setEditItem({ ...editItem, name: e.target.value })
                            }
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Autocomplete
                            disablePortal
                            options={category}
                            value={editItem.category || null}
                            sx={{
                              width: '100',
                              mx: '5px',
                            }}
                            onChange={(event, newValue) => {
                              setEditItem({
                                ...editItem,
                                category: newValue,
                              });
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label="Category" />
                            )}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            type="date"
                            label="Expiry"
                            sx={{
                              width: '100',
                              mx: '5px',
                            }}
                            variant="outlined"
                            value={editItem.date}
                            onChange={(e) =>
                              setEditItem({ ...editItem, date: e.target.value })
                            }
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            type="number"
                            label="Quantity"
                            sx={{
                              width: '100',
                              mx: '5px',
                            }}
                            variant="outlined"
                            value={editItem.qty}
                            onChange={(e) =>
                              setEditItem({ ...editItem, qty: e.target.value })
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => updateItem(i.id)}
                            sx={{
                              backgroundColor: 'orangered',
                              color: 'white',
                              '&:hover': { backgroundColor: 'darkorange' },
                              width: '100',
                              marginLeft: '2%',
                            }}
                          >
                            <SaveIcon />
                          </Button>
                          <Button
                            onClick={() => cancelEdit()}
                            sx={{
                              backgroundColor: 'orangered',
                              color: 'white',
                              '&:hover': { backgroundColor: 'darkorange' },
                              width: '100',
                              marginLeft: '2%',
                            }}
                          >
                            <CancelIcon />
                          </Button>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={3}>
                          <Typography
                            variant="h5"
                            color={'#333'}
                            textAlign={'center'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              fontSize: '1rem',
                            }}
                          >
                            {typeof i.name === 'string'
                              ? i.name.charAt(0).toUpperCase() + i.name.slice(1)
                              : 'Invalid item'}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography
                            variant="h5"
                            color={'#333'}
                            textAlign={'center'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              fontSize: '1rem',
                            }}
                          >
                            {i.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography
                            variant="h5"
                            color={'#333'}
                            textAlign={'center'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              fontSize: '1rem',
                            }}
                          >
                            {i.date}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography
                            variant="h5"
                            color={'#333'}
                            textAlign={'center'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              fontSize: '1rem',
                            }}
                          >
                            {i.qty}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Button
                            onClick={() => enterEditMode(i)}
                            sx={{
                              backgroundColor: 'orangered',
                              color: 'white',
                              '&:hover': { backgroundColor: 'darkorange' },
                              width: '48%',
                              marginLeft: '2%',
                            }}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(i)}
                            sx={{
                              backgroundColor: 'orangered',
                              color: 'white',
                              '&:hover': { backgroundColor: 'darkorange' },
                              width: '48%',
                              marginLeft: '2%',
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Stack>

          </Box>
        </Box>

        {/* Filter Dialog */}
        <Dialog open={filterDialogOpen} onClose={closeFilterDialog}>
          <DialogTitle textAlign={'center'}>Filter Items</DialogTitle>
          <DialogContent>
            <TextField
              label="Item Name"
              fullWidth
              value={filterCriteria.name}
              onChange={(e) =>
                setFilterCriteria({ ...filterCriteria, name: e.target.value })
              }
              sx={{ my: 2 }}
            />
            <Autocomplete
              disablePortal
              options={category}
              sx={{ my: 2 }}
              value={filterCriteria.category || null}
              onChange={(event, newValue) => {
                setFilterCriteria({ ...filterCriteria, category: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth />
              )}
            />
            <TextField
              type="date"
              label="Expiration Date"
              fullWidth
              value={filterCriteria.date}
              sx={{ my: 2 }}
              onChange={(e) =>
                setFilterCriteria({ ...filterCriteria, date: e.target.value })
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              type="number"
              label="Quantity"
              fullWidth
              value={filterCriteria.qty}
              sx={{ my: 2 }}
              onChange={(e) =>
                setFilterCriteria({ ...filterCriteria, qty: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={applyFilter} sx={{ color: 'orangered' }}>
              Apply Filter
            </Button>
            <Button onClick={closeFilterDialog} sx={{ color: 'orangered' }}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle textAlign={'center'}>Delete Items</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{' '}
              {itemToDelete !== null
                ? itemToDelete.name.charAt(0).toUpperCase() +
                itemToDelete.name.slice(1)
                : ''}
              ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={confirmDelete}
              sx={{
                color: 'red',
              }}
            >
              Delete
            </Button>
            <Button onClick={closeDeleteDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
