'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Import Firebase auth configuration

export default function CreateAccount() {
    // State variables for form inputs
    const [name, setName] = useState(''); // New state for name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Email validation function using a regular expression
    const isValidEmail = (email) => {
        // This regular expression covers most common valid email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Name validation function using a regular expression
    const isValidName = (name) => {
        // This regular expression covers common valid name formats
        const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
        return nameRegex.test(name);
    };

    const isValidPassword = (password) => {
        // Regular expression for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    // Handler for form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (name.length < 1) {
            setError('Name must atleast be 2 characters.');
            setSuccess('');
            return; // Exit early if name is invalid
        }
        if (name.length > 50) {
            setError('Name must be less than 50 characters.');
            setSuccess('');
            return; // Exit early if name is invalid
        }

        // Validate name format
        if (!isValidName(name)) {
            setError('Invalid name format. Please use only letters, spaces, hyphens, or apostrophes.');
            setSuccess('');
            return; // Exit early if name is invalid
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError('Invalid email format.');
            setSuccess('');
            return; // Exit early if email is invalid
        }

        if (!isValidPassword(password)) {
            setError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
            setSuccess('');
            return; // Exit early if password is invalid
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setSuccess('');
            return; // Exit early if passwords don't match
        }

        try {
            // Attempt to create a new user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User account created:', userCredential.user);
            console.log('User name:', name); // Log the user's name
            setSuccess('Account created successfully! You can now log in.');
            setError('');
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error creating account:', error);
            setError('Failed to create account. ' + error.message);
            setSuccess('');
        }
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            bgcolor="#1A4D2E"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Box
                id="create-account-container"
                width="500px"
                padding="30px"
                bgcolor="#E8DFCA"
                borderRadius="10px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)" // Add subtle shadow
            >
                <Typography
                    color="#1A4D2E"
                    variant="h3"
                    textAlign="center"
                    mb={3}
                    sx={{ fontWeight: 'bold', borderBottom: '3px solid #1A4D2E', paddingBottom: '10px', width: '100%' }}
                >
                    Create Account
                </Typography>

                {/* Create Account Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'center' }}>
                    <Typography mb={1} fontSize="18px" color="#1A4D2E">
                        Name
                    </Typography>
                    <TextField
                        id="name"
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />

                    <Typography mb={1} fontSize="18px" color="#1A4D2E">
                        Email
                    </Typography>
                    <TextField
                        id="email"
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />

                    <Typography mb={1} fontSize="18px" color="#1A4D2E">
                        Password
                    </Typography>
                    <TextField
                        id="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Set password state
                        sx={{ mb: 2 }}
                        required
                    />
                    <Typography mb={1} fontSize="18px" color="#1A4D2E">
                        Confirm Password
                    </Typography>
                    <TextField
                        id="confirm-password"
                        label="Confirm Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={confirmPassword} // Set confirmPassword state
                        onChange={(e) => setConfirmPassword(e.target.value)} // Corrected handler
                        sx={{ mb: 2 }}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        sx={{
                            backgroundColor: 'orangered',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#4F6F52',
                            },
                            mb: 2,
                        }}
                    >
                        Create Account
                    </Button>
                </form>

                {error && (
                    <Typography bgcolor="#e57373"
                        color="#721c24"
                        px={2}
                        py={1}
                        borderRadius={1}
                        textAlign="center"
                        mt="4px"
                        maxWidth={"90%"}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Typography color="green" mt={2}>
                        {success}
                    </Typography>
                )}

                <Typography color="#1A4D2E" mt="10px">
                    Already have an account?&nbsp;
                    <Link href="/login" passHref>
                        Log in
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}
