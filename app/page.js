'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Typed from 'typed.js';
import { Lateef } from 'next/font/google';

const lateef = Lateef({
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function MainPage() {
  const typedElement = useRef(null);

  useEffect(() => {
    const options = {
      strings: [
        'P', 'Pa', 'Pan', 'Pant', 'Pantr', 'Pantry', 'PantryP', 'PantryPR', 'PantryPRO'
      ],
      typeSpeed: 0.2,  // Increase typing speed (smaller value = faster)
      backSpeed: 0.2,  // Increase backspacing speed
      startDelay: 0, // Short delay before typing starts
      backDelay: 500,  // Short delay before backspacing
      loop: true,
      loopCount: Infinity
    };

    const typed = new Typed(typedElement.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="#1A4D2E"
      >
        <Typography
          color="#E8DFCA"
          variant="h1"
          sx={{ fontFamily: 'Roboto', fontWeight: 700 }}
          textAlign={'center'}
        >
          WELCOME to{' '}
          <br />
          <span ref={typedElement}></span>
        </Typography>

        <Typography color="#E8DFCA" variant="h5" mt={2}>
          Your very own pantry customization website where you can track all your items.
        </Typography>
        <Button href="/login" sx={{
          bgcolor: "black",
          height: 'auto',
          width: 'auto',
          fontSize: '25px',
          padding: '10px',
          backgroundColor: 'orangered',
          color: 'white',
          '&:hover': {
            backgroundColor: '#4F6F52'
          },
          margin: "50px",
          borderRadius: "10px"
        }}>
          Begin your Journey
        </Button>
      </Box>
    </>
  );
}
