import React, { useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import { keyframes } from '@emotion/react';
import { Dashboard } from '@mui/icons-material';
import { chatAPI } from '../api/client';
import { cookieUtils } from '../utils/cookieUtils';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.createSession();
      const sessionId = response.data.sessionId || response.data.data?.id;

      if (sessionId) {
        // Store session ID in cookie
        cookieUtils.setSessionCookie(sessionId);
        // Navigate to chat
        navigate('/chat');
      } else {
        console.error('Failed to get session ID from response');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4af37 0%, #e5c158 100%)',
          opacity: 0.1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a2332 0%, #2d3e5f 100%)',
          opacity: 0.05,
        }}
      />

      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          {/* Header */}
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              color: '#1a2332',
              animation: `${fadeInUp} 0.8s ease-out 0.1s both`,
              letterSpacing: '-2px',
            }}
          >
            Cincinnati Hotel
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: '#5a6c7d',
              fontWeight: 300,
              letterSpacing: '1px',
              animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
            }}
          >
            AI Assistant
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 8,
              color: '#5a6c7d',
              animation: `${fadeInUp} 0.8s ease-out 0.3s both`,
              fontSize: '1.05rem',
            }}
          >
            Welcome to our hotel information system. Ask me anything about our facilities, rooms, amenities, and services.
          </Typography>

          {/* Chat Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ChatIcon sx={{ fontSize: '1.5rem' }} />}
            onClick={handleStartChat}
            disabled={loading}
            sx={{
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
              fontSize: '1.1rem',
              px: 6,
              py: 1.5,
            }}
          >
            {loading ? 'Starting...' : 'Start Chatting'}
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<Dashboard sx={{ fontSize: '1.5rem' }} />}
            onClick={() => navigate('/admin')}
            sx={{
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
              fontSize: '1.1rem',
              px: 6,
              py: 1.5,
            }}
          >
            Admin Dashboard
          </Button>
         </Box>
        </Box>
      </Container>
    </Box>
  );
};
