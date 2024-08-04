'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Typical from 'react-typical';
import { Lateef } from 'next/font/google';

const lateef = Lateef({
  subsets: ['latin'],
  weight: ['400', '700']
})

export default function MainPage() {

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
          WELCOME to{' '} <br />
          <Typical
            steps={[
              'P', 280,
              'Pa', 280,
              'Pan', 280,
              'Pant', 280,
              'Pantr', 280,
              'Pantry', 280,
              'PantryP', 200,
              'PantryPR', 200,
              'PantryPRO', 3000
            ]}
            loop={Infinity}
            wrapper="span"
          />
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
