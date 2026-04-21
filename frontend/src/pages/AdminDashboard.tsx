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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  const cleanupStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Fetch initial statistics
    fetchStatistics();

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (files[0].type === 'application/pdf') {
        setSelectedFile(files[0]);
        setUploadMessage(null);
      } else {
        setUploadMessage({
          type: 'error',
          text: 'Please select a PDF file.',
        });
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
      setSelectedFile(null);
      // Refresh statistics
      await fetchStatistics();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadMessage({
        type: 'error',
        text: 'Failed to upload PDF. Please try again.',
      });
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
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="pdf-input"
                />
                <label htmlFor="pdf-input" style={{ cursor: 'pointer' }}>
                  <Typography variant="body2" sx={{ color: '#5a6c7d' }}>
                    {selectedFile ? (
                      <>
                        <strong>Selected:</strong> {selectedFile.name}
                      </>
                    ) : (
                      <>
                        Click to select PDF or drag and drop
                      </>
                    )}
                  </Typography>
                </label>
              </Box>

              {uploadMessage && (
                <Alert severity={uploadMessage.type} sx={{ mb: 2 }}>
                  {uploadMessage.text}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                sx={{
                  mb: 2,
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
