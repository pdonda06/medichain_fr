import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  CheckCircle,
  FileUp,
  ArrowLeft,
  Eye,
  PlusCircle
} from 'lucide-react';
import HealthDataForm from '../components/HealthDataForm';

function AddReport() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(null);

  const handleSuccess = (data) => {
    console.log('Report submission successful, received data:', data);
    setSubmitted(true);
    setReportId(data._id);
    toast.success('Report added successfully');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileUp size={30} color={theme.palette.primary.main} />
          Add New Health Report
        </Typography>
        
        {submitted ? (
          <Fade in={submitted}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 2, 
                mb: 3,
                boxShadow: theme.shadows[5],
                transition: '0.3s',
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CheckCircle 
                  color={theme.palette.success.main} 
                  size={isMobile ? 50 : 70}
                  style={{
                    marginBottom: '16px',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <Typography variant="h5" color="success.main" gutterBottom fontWeight={600}>
                  Report Created Successfully!
                </Typography>
                <Typography variant="body1">
                  Your report has been created and saved{reportId ? ' as a draft' : ''}.
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                justifyContent="center" 
                sx={{ mt: 3 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ArrowLeft size={18} />}
                  onClick={() => navigate('/view-reports')}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius: '10px',
                    boxShadow: theme.shadows[2],
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                >
                  View All Reports
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<Eye size={18} />}
                  onClick={() => navigate(`/report/${reportId}`)}
                  fullWidth={isMobile}
                  disabled={!reportId}
                  sx={{
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    '&:hover:not(:disabled)': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  View This Report
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<PlusCircle size={18} />}
                  size="large"
                  onClick={() => {
                    setSubmitted(false);
                    setReportId(null);
                  }}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Create Another Report
                </Button>
              </Stack>
            </Paper>
          </Fade>
        ) : (
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              transition: '0.3s',
              '&:hover': {
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: '10px',
                '& .MuiAlert-icon': {
                  fontSize: 24
                }
              }}
            >
              <Typography variant="body1">
                Complete the form below to add a new health data report. All fields marked with an asterisk (*) are required.
              </Typography>
            </Alert>
            
            <HealthDataForm onSuccess={handleSuccess} />
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default AddReport; 