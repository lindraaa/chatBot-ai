import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { chatAPI } from '../api/client';
import { cookieUtils } from '../utils/cookieUtils';
import { storageUtils } from '../utils/storageUtils';
import { validationUtils } from '../utils/validationUtils';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

export const UserChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Welcome to Cincinnati Hotel! I am your AI assistant. How can I help you today? Feel free to ask me anything about our facilities, rooms, amenities, or services.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [contactErrors, setContactErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get session from cookie
    const storedSessionId = cookieUtils.getSessionCookie();
    if (storedSessionId) {
      setSessionId(storedSessionId);

      // Load stored messages for this session
      const storedMessages = storageUtils.getMessages(storedSessionId);
      if (storedMessages && storedMessages.length > 0) {
        // Add welcome message if not already present, then add stored messages
        const welcomeMessage: Message = {
          id: '1',
          sender: 'bot',
          text: 'Welcome to Cincinnati Hotel! I am your AI assistant. How can I help you today? Feel free to ask me anything about our facilities, rooms, amenities, or services.',
          timestamp: new Date(),
        };

        // Check if first stored message is the welcome message
        const isWelcomeAlreadyPresent = storedMessages[0]?.text.includes('Welcome to Cincinnati Hotel');
        const messagesToSet = isWelcomeAlreadyPresent
          ? storedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
          : [welcomeMessage, ...storedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))];

        setMessages(messagesToSet);
      }
    } else {
      // Fallback: create new session if not in cookie
      const initSession = async () => {
        try {
          const response = await chatAPI.createSession();
          const newSessionId = response.data.sessionId || response.data.data?.id;
          if (newSessionId) {
            setSessionId(newSessionId);
            cookieUtils.setSessionCookie(newSessionId);
          }
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      };
      initSession();
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Save messages to storage whenever they change
    if (sessionId && messages.length > 0) {
      const storableMessages = messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      }));
      storageUtils.saveMessages(sessionId, storableMessages);
    }
  }, [messages, sessionId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      console.log('Sending message with sessionId:', sessionId);
      const response = await chatAPI.sendMessage(inputValue, sessionId);
      console.log('API Response:', response);

      const messageText = response.data.message || response.data.data?.message;
      const couldNotAnswer = response.data.couldNotAnswer || response.data.data?.couldNotAnswer || false;

      if (!messageText) {
        console.error('No message found in response:', response.data);
        throw new Error('No message in response');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: messageText,
        timestamp: new Date(),
      };

      console.log('Adding bot message:', botMessage);
      setMessages((prev) => [...prev, botMessage]);

      // If bot couldn't find answer, show contact form option
      if (couldNotAnswer) {
        setShowContactForm(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleContactFieldChange = (field: 'name' | 'email' | 'phone', value: string) => {
    setContactForm({ ...contactForm, [field]: value });

    // Validate field
    let error = '';
    if (field === 'name') {
      error = validationUtils.getNameError(value) || '';
    } else if (field === 'email') {
      error = validationUtils.getEmailError(value) || '';
    } else if (field === 'phone') {
      error = validationUtils.getPhoneError(value) || '';
    }

    setContactErrors({ ...contactErrors, [field]: error });
  };

  const isContactFormValid = (): boolean => {
    return (
      validationUtils.isValidName(contactForm.name) &&
      validationUtils.isValidEmail(contactForm.email) &&
      validationUtils.isValidPhone(contactForm.phone)
    );
  };

  const handleContactFormSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      return;
    }

    try {
      setContactSubmitting(true);
      const conversationContext = messages
        .map((m) => `${m.sender}: ${m.text}`)
        .join('\n');

      console.log('Submitting contact form with sessionId:', sessionId);

      await chatAPI.submitContactForm({
        ...contactForm,
        question: messages[messages.length - 2]?.text || 'General inquiry',
        conversationContext,
        sessionId,
      });

      const confirmMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Thank you! We have received your contact information and will get back to you soon. A customer service representative will reach out to you shortly.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, confirmMessage]);
      setShowContactForm(false);
      setContactForm({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      alert('Failed to submit contact form. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaef 100%)',
        py: 3,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            animation: 'fadeInDown 0.5s ease-out',
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              color: '#1a2332',
              '&:hover': {
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Cincinnati Hotel Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: '#5a6c7d' }}>
              Ask me anything about the hotel
            </Typography>
          </Box>
        </Box>

        {/* Chat Container */}
        <Paper
          sx={{
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor: '#ffffff',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f5f5f5',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#d4af37',
                borderRadius: '4px',
              },
            }}
          >
            {messages.map((message, _index) => (
              <Box key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      message.sender === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'fadeInUp 0.3s ease-out',
                  }}
                >
                  <Card
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      backgroundColor:
                        message.sender === 'user' ? '#1a2332' : '#f0f0f0',
                      color:
                        message.sender === 'user' ? '#ffffff' : '#1a2332',
                      borderRadius: '12px',
                      border:
                        message.sender === 'user'
                          ? 'none'
                          : '1px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Card>
                </Box>

                {/* Contact Button below bot messages */}
                
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Card
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    backgroundColor: '#f0f0f0',
                    color: '#1a2332',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#5a6c7d' }}>
                      Bot is typing
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '4px',
                        '& span': {
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#d4af37',
                          animation: `${keyframes`
                            0%, 60%, 100% {
                              opacity: 0.3;
                              transform: translateY(0);
                            }
                            30% {
                              opacity: 1;
                              transform: translateY(-10px);
                            }
                          `} 1.4s infinite`,
                        },
                      }}
                    >
                      <span style={{ animationDelay: '0s' }} />
                      <span style={{ animationDelay: '0.2s' }} />
                      <span style={{ animationDelay: '0.4s' }} />
                    </Box>
                  </Box>
                </Card>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              multiline
              maxRows={3}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              sx={{
                minWidth: '100px',
              }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Contact Form Dialog */}
      <Dialog
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setContactErrors({ name: '', email: '', phone: '' });
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif' }}>
          Leave Your Contact Information
        </DialogTitle>
        <DialogContent sx={{ minWidth: '400px', pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Our team will be happy to help answer your question! Please provide
            your contact details.
          </Alert>
          <TextField
            fullWidth
            label="Full Name"
            value={contactForm.name}
            onChange={(e) => handleContactFieldChange('name', e.target.value)}
            error={!!contactErrors.name}
            helperText={contactErrors.name}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={contactForm.email}
            onChange={(e) => handleContactFieldChange('email', e.target.value)}
            error={!!contactErrors.email}
            helperText={contactErrors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            type="number"
            value={contactForm.phone}
            onChange={(e) => handleContactFieldChange('phone', e.target.value)}
            error={!!contactErrors.phone}
            helperText={contactErrors.phone}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactForm(false)} disabled={contactSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleContactFormSubmit}
            disabled={!isContactFormValid() || contactSubmitting}
            sx={{
              position: 'relative',
            }}
          >
            {contactSubmitting ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    marginLeft: '-10px',
                  }}
                />
                <span style={{ visibility: 'hidden' }}>Submit</span>
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
