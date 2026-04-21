import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Card,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
  Slide,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../api/client';

interface TopicStats {
  topic: string;
  count: number;
}

interface Statistics {
  totalSessions: number;
  totalQuestions: number;
  questionsByTopic: TopicStats[];
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  n8n_file_id: string;
  uploaded_at: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const cleanupStreamRef = useRef<(() => void) | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch initial statistics and uploaded files
    fetchStatistics();
    fetchUploadedFiles();

    // Setup real-time stats stream
    setupStatsStream();

    // Cleanup on unmount
    return () => {
      if (cleanupStreamRef.current) {
        cleanupStreamRef.current();
      }
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getStatistics();
      const statsData = response.data.data || response.data;
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await chatAPI.getUploadedFiles();
      console.log('Uploaded files response:', response);
      const files = response.data.data || response.data;
      console.log('Parsed files:', files);
      if (Array.isArray(files) && files.length > 0) {
        console.log('Setting uploaded file:', files[0]);
        setUploadedFile(files[0]);
      }
    } catch (error) {
      console.error('Failed to fetch uploaded files:', error);
    }
  };

  const setupStatsStream = () => {
    try {
      const cleanup = chatAPI.streamStatistics(
        (stats: Statistics) => {
          setStatistics(stats);
          setStreamConnected(true);
        },
        (error) => {
          console.error('Stats stream error:', error);
          setStreamConnected(false);
        }
      );

      cleanupStreamRef.current = cleanup;
    } catch (error) {
      console.error('Failed to setup stats stream:', error);
      setStreamConnected(false);
    }
  };

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (uploadMessage && showAlert) {
      alertTimeoutRef.current = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => {
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
      };
    }
  }, [uploadMessage, showAlert]);

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check MIME type
    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Only PDF files are allowed.`,
      };
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return {
        valid: false,
        error: 'Invalid file extension. Only .pdf files are allowed.',
      };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const validation = validateFile(files[0]);
      if (validation.valid) {
        setSelectedFile(files[0]);
        setUploadMessage(null);
      } else {
        setUploadMessage({
          type: 'error',
          text: validation.error || 'Invalid file. Please select a PDF file.',
        });
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const validation = validateFile(files[0]);
      if (validation.valid) {
        setSelectedFile(files[0]);
        setUploadMessage(null);
      } else {
        setUploadMessage({
          type: 'error',
          text: validation.error || 'Invalid file. Please select a PDF file.',
        });
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await chatAPI.uploadPDF(selectedFile);
      setUploadMessage({
        type: 'success',
        text: 'PDF uploaded successfully! The knowledge base has been updated.',
      });
      setShowAlert(true);
      setSelectedFile(null);
      // Refresh statistics and uploaded files
      await fetchStatistics();
      await fetchUploadedFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadMessage({
        type: 'error',
        text: 'Failed to upload PDF. Please try again.',
      });
      setShowAlert(true);
    } finally {
      setUploading(false);
    }
  };

  const totalQuestions =
    statistics?.questionsByTopic?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eaef 100%)',
        py: 4,
      }}
    >
      {/* Top Alert with Smooth Animation */}
      <Slide direction="down" in={uploadMessage !== null && showAlert} mountOnEnter unmountOnExit>
        <Alert
          onClose={handleCloseAlert}
          severity={uploadMessage?.type || 'info'}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            borderRadius: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: uploadMessage ? 'slideDown 0.3s ease-out' : 'none',
            '@keyframes slideDown': {
              from: {
                transform: 'translateY(-100%)',
                opacity: 0,
              },
              to: {
                transform: 'translateY(0)',
                opacity: 1,
              },
            },
          }}
        >
          {uploadMessage?.text}
        </Alert>
      </Slide>

      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: '#1a2332',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                },
              }}
            >
              Back
            </Button>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                color: '#1a2332',
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
  
        </Box>

        <Grid container spacing={3}>
          {/* PDF Upload Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                border: '2px dashed #d4af37',
                backgroundColor: '#fafafa',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudUploadIcon
                  sx={{
                    fontSize: '2rem',
                    color: '#d4af37',
                    mr: 2,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Upload Hotel Information PDF
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#5a6c7d', mb: 3 }}>
                Upload a new PDF document containing hotel information. This will
                replace the previous knowledge base used by the chatbot.
              </Typography>

              <Box
                sx={{
                  border: '2px dashed #d4af37',
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  mb: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                  cursor: 'pointer',
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="pdf-input"
                  ref={fileInputRef}
                />
                <label htmlFor="pdf-input" style={{ cursor: 'pointer' }}>
                  <Typography variant="body2" sx={{ color: '#5a6c7d' }}>
                    {selectedFile ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <strong>Selected:</strong> {selectedFile.name}
                        </Box>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClearFile();
                          }}
                          sx={{
                            minWidth: 'auto',
                            p: '4px 8px',
                            color: '#d4af37',
                            '&:hover': {
                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                            },
                          }}
                        >
                          <ClearIcon sx={{ fontSize: '1.2rem' }} />
                        </Button>
                      </Box>
                    ) : (
                      <>
                        Click to select PDF or drag and drop
                      </>
                    )}
                  </Typography>
                </label>
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                sx={{
                  mb: 3,
                }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  'Upload PDF'
                )}
              </Button>

              {uploadedFile && (
                <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#5a6c7d', mb: 1.5 }}>
                    📄 Current File:
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f0f0f0',
                      p: 2,
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#1a2332', fontWeight: 500 }}>
                      {uploadedFile.file_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
                      Uploaded: {new Date(uploadedFile.uploaded_at).toLocaleDateString()} at {new Date(uploadedFile.uploaded_at).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#9a9a9a' }}>
                Supported format: PDF only. Max file size: 50MB
              </Typography>
            </Card>
          </Grid>

          {/* Statistics Summary Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Total Sessions */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#5a6c7d', fontWeight: 600 }}
                  >
                    Total Chat Sessions
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                    {loading && !statistics ? (
                      <CircularProgress size={32} />
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          sx={{
                            color: '#d4af37',
                            fontWeight: 700,
                          }}
                        >
                          {statistics?.totalSessions || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, color: '#5a6c7d' }}>
                          sessions
                        </Typography>
                      </>
                    )}
                  </Box>
                </Card>
              </Grid>

              {/* Total Questions */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#5a6c7d', fontWeight: 600 }}
                  >
                    Total Questions Asked
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                    {loading && !statistics ? (
                      <CircularProgress size={32} />
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          sx={{
                            color: '#d4af37',
                            fontWeight: 700,
                          }}
                        >
                          {totalQuestions}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, color: '#5a6c7d' }}>
                          questions
                        </Typography>
                      </>
                    )}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Questions by Topic Table */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon
                  sx={{
                    fontSize: '1.5rem',
                    color: '#d4af37',
                    mr: 1,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Questions by Topic
                </Typography>
              </Box>

              {loading && !statistics ? (
                <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
              ) : statistics?.questionsByTopic &&
                statistics.questionsByTopic.length > 0 ? (
                <TableContainer component={Paper} sx={{ backgroundColor: '#fafafa' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1a2332' }}>
                          Topic
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#1a2332' }}>
                          Number of Questions
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1a2332' }}>
                          Percentage
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.questionsByTopic.map((item) => {
                        const percentage =
                          totalQuestions > 0
                            ? ((item.count / totalQuestions) * 100).toFixed(1)
                            : '0';
                        return (
                          <TableRow key={item.topic}>
                            <TableCell sx={{ color: '#1a2332' }}>
                              {item.topic}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#d4af37', fontWeight: 600 }}>
                              {item.count}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={parseFloat(percentage)}
                                  sx={{
                                    mr: 2,
                                    width: '100px',
                                    backgroundColor: '#e0e0e0',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: '#d4af37',
                                    },
                                  }}
                                />
                                <Typography variant="body2">
                                  {percentage}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ color: '#5a6c7d', textAlign: 'center', py: 3 }}>
                  No questions asked yet
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
