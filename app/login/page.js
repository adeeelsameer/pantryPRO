'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Import Firebase auth configuration

export default function Login() {
    // State variables for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize router
    const router = useRouter();

    // Handler for form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Attempt to sign in the user with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log('User logged in:', userCredential.user);
            setSuccess('Login successful!');
            setError('');

            // Redirect user to the pantry page
            router.push('/pantry'); // Redirect to the pantry page

            // Optionally clear fields
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Failed to log in. ' + error.message);
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
                id="login-container"
                width="400px"
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
                    sx={{
                        fontWeight: 'bold',
                        borderBottom: '3px solid #1A4D2E',
                        paddingBottom: '10px',
                        width: '100%',
                    }}
                >
                    Log In
                </Typography>

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    style={{ width: '100%', textAlign: 'center' }}
                >
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
                        onChange={(e) => setPassword(e.target.value)}
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
                        Log In
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
                        maxWidth={'90%'}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Typography bgcolor="#77dd77"
                        color="#1A4D2E"
                        px={2}
                        py={1}
                        borderRadius={1}
                        textAlign="center"
                        mt="4px"
                        maxWidth={'90%'}>
                        {success}
                    </Typography>
                )}

                <Typography color="#1A4D2E" mt="10px">
                    Don&apos;t have an account?&nbsp;
                    <Link href="/create-account" passHref>
                        Create one
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}
