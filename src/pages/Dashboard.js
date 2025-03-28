import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHealthData } from '../features/healthData/healthDataSlice';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  LinearProgress,
  Avatar,
  Chip
} from '@mui/material';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Hospital, 
  FileEdit, 
  PlusCircle, 
  Users, 
  Building2, 
  Eye, 
  BarChart3,
  PieChart
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { user } = useSelector((state) => state.auth);
  const { healthData, isLoading } = useSelector((state) => state.healthData);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Fetch health data based on user role
      dispatch(getHealthData({}));
    }
  }, [user, navigate, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get gradient colors based on theme
  const getGradient = (color) => {
    const colors = {
      primary: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      secondary: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
      success: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
      warning: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
      error: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
      info: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
    };
    return colors[color] || colors.primary;
  };

  // Calculate completion percentage based on reports status
  const getCompletionPercentage = () => {
    if (!healthData || healthData.length === 0) return 0;
    const approved = healthData.filter(data => data.status === 'approved').length;
    return Math.round((approved / healthData.length) * 100);
  };

  // Render dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    // Common action buttons based on role
    const getActionButtons = (role) => {
      const buttons = [];
      
      if (role === 'super-admin' || role === 'state-admin' || role === 'district-admin' || role === 'hospital-admin') {
        buttons.push(
          { 
            label: 'View Reports', 
            icon: <Eye size={20} />, 
            onClick: () => navigate('/view-reports'), 
            color: 'primary',
            description: 'View and manage all reports'
          },
          { 
            label: 'Add Report', 
            icon: <PlusCircle size={20} />, 
            onClick: () => navigate('/add-report'), 
            color: 'secondary',
            description: 'Create a new health report'
          },
          { 
            label: 'Manage Departments', 
            icon: <Building2 size={20} />, 
            onClick: () => navigate('/manage-departments'), 
            color: 'info',
            description: 'Manage healthcare departments'
          },
          { 
            label: 'Manage Users', 
            icon: <Users size={20} />, 
            onClick: () => navigate('/manage-users'), 
            color: 'warning',
            description: 'Manage system users and roles'
          }
        );
      } else if (role === 'department-user') {
        buttons.push(
          { 
            label: 'Add Report', 
            icon: <PlusCircle size={20} />, 
            onClick: () => navigate('/add-report'), 
            color: 'secondary',
            description: 'Create a new health report'
          },
          { 
            label: 'View My Reports', 
            icon: <Eye size={20} />, 
            onClick: () => navigate('/view-reports'), 
            color: 'primary',
            description: 'View your submitted reports'
          }
        );
      }
      
      return buttons;
    };

    // Dashboard title and description based on role
    const getDashboardInfo = (role) => {
      switch(role) {
        case 'super-admin':
          return {
            title: 'Super Admin Dashboard',
            description: 'You have full access to all health reports across all facilities, departments, districts, and states.',
            alertSeverity: 'info',
            icon: <Users color={theme.palette.info.main} size={24} style={{ marginRight: '10px' }} />
          };
        case 'state-admin':
          return {
            title: 'State Admin Dashboard',
            description: 'You have access to all health reports within your state.',
            alertSeverity: 'info',
            icon: <Building2 color={theme.palette.info.main} size={24} style={{ marginRight: '10px' }} />
          };
        case 'district-admin':
          return {
            title: 'District Admin Dashboard',
            description: 'You have access to all health reports within your district.',
            alertSeverity: 'info',
            icon: <Building2 color={theme.palette.info.main} size={24} style={{ marginRight: '10px' }} />
          };
        case 'hospital-admin':
          return {
            title: 'Hospital Admin Dashboard',
            description: 'You have access to all health reports within your hospital.',
            alertSeverity: 'info',
            icon: <Hospital color={theme.palette.info.main} size={24} style={{ marginRight: '10px' }} />
          };
        case 'department-user':
          return {
            title: 'Department User Dashboard',
            description: 'You can create and manage reports for your department.',
            alertSeverity: 'success',
            icon: <FileText color={theme.palette.success.main} size={24} style={{ marginRight: '10px' }} />
          };
        default:
          return {
            title: 'Dashboard',
            description: 'Welcome to MediCare Health Management System',
            alertSeverity: 'info',
            icon: <Hospital color={theme.palette.info.main} size={24} style={{ marginRight: '10px' }} />
          };
      }
    };

    // Get dashboard cards based on role
    const getDashboardCards = (role) => {
      const cards = [
        {
          title: 'Total Reports',
          count: healthData ? healthData.length : 0,
          icon: <FileText size={32} />,
          color: 'primary'
        }
      ];
      
      if (role === 'super-admin' || role === 'state-admin' || role === 'district-admin') {
        cards.push(
          {
            title: 'Pending Review',
            count: healthData ? healthData.filter(data => data.status === 'submitted').length : 0,
            icon: <Clock size={32} />,
            color: 'warning'
          },
          {
            title: 'Approved',
            count: healthData ? healthData.filter(data => data.status === 'approved').length : 0,
            icon: <CheckCircle size={32} />,
            color: 'success'
          },
          {
            title: 'Rejected',
            count: healthData ? healthData.filter(data => data.status === 'rejected').length : 0,
            icon: <AlertTriangle size={32} />,
            color: 'error'
          }
        );
      } else if (role === 'hospital-admin' || role === 'department-user') {
        cards.push(
          {
            title: 'Draft Reports',
            count: healthData ? healthData.filter(data => data.status === 'draft').length : 0,
            icon: <FileEdit size={32} />,
            color: 'info'
          },
          {
            title: 'Submitted',
            count: healthData ? healthData.filter(data => data.status === 'submitted').length : 0,
            icon: <Clock size={32} />,
            color: 'warning'
          },
          {
            title: role === 'department-user' ? 'Approved' : 'Approved Reports',
            count: healthData ? healthData.filter(data => data.status === 'approved').length : 0,
            icon: <CheckCircle size={32} />,
            color: 'success'
          }
        );
      }
      
      return cards;
    };

    // Get dashboard info, cards and actions based on user role
    const dashboardInfo = getDashboardInfo(user.role);
    const dashboardCards = getDashboardCards(user.role);
    const actionButtons = getActionButtons(user.role);
    const completionPercentage = getCompletionPercentage();

    // Render unified dashboard with Material UI components
      return (
      <Box>
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 3, 
            boxShadow: theme.shadows[2],
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(https://images.unsplash.com/photo-1631815590052-01bfa92eecd4?q=80&w=1200)' 
              : 'linear-gradient(to right, rgba(30,30,30,0.9), rgba(30,30,30,0.95)), url(https://images.unsplash.com/photo-1631815590052-01bfa92eecd4?q=80&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' }
          }}
        >
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {dashboardInfo.icon}
              {dashboardInfo.title}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: '700px' }}
            >
              <strong>{user.name}</strong>: {dashboardInfo.description}
            </Typography>
          </Box>
          
          {user.role !== 'department-user' && !isMobile && (
            <Chip 
              label={`${user.facilityName || user.district || user.state || 'System'}`}
              variant="outlined"
              color="primary"
              sx={{ 
                borderRadius: '16px', 
                px: 1,
                height: 32,
                fontWeight: 600
              }}
            />
          )}
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    opacity: 0.9,
                    background: getGradient(card.color),
                    zIndex: 0
                  }} 
                />
                <CardContent 
                  sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    height: '100%', 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 3
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {card.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant={isTablet || isMobile ? "h4" : "h2"} fontWeight={700}>
                      {card.count}
                    </Typography>
                    <Box 
                      sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Progress Overview Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <BarChart3 size={24} color={theme.palette.primary.main} style={{ marginRight: 10 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Reports Completion Overview
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Progress
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {completionPercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionPercentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
                    }} 
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
            {healthData && healthData.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Reports
                    </Typography>
                    {healthData.slice(0, 3).map((report, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          py: 1.5, 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: idx < 2 ? `1px solid ${theme.palette.divider}` : 'none'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2, 
                              bgcolor: theme.palette.primary.main 
                            }}
                          >
                            <FileText size={20} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {report.departmentName} Report
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(report.submittedAt || report.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={report.status.charAt(0).toUpperCase() + report.status.slice(1)} 
                          size="small"
                          color={
                            report.status === 'approved' ? 'success' : 
                            report.status === 'submitted' ? 'primary' :
                            report.status === 'rejected' ? 'error' : 
                            'default'
                          }
                          sx={{ borderRadius: '16px', fontWeight: 500 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No reports available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Distribution Overview Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <PieChart size={24} color={theme.palette.primary.main} style={{ marginRight: 10 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Reports Status
                  </Typography>
                </Box>
                
                {healthData && healthData.length > 0 ? (
                  <Box>
                    {['draft', 'submitted', 'approved', 'rejected'].map((status) => {
                      const count = healthData.filter(data => data.status === status).length;
                      const percentage = Math.round((count / healthData.length) * 100) || 0;
                      
                      return (
                        <Box key={status} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {status}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {count} ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            color={
                              status === 'approved' ? 'success' : 
                              status === 'submitted' ? 'primary' :
                              status === 'rejected' ? 'error' : 
                              'info'
                            }
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
                            }} 
                          />
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No reports available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <PlusCircle size={24} color={theme.palette.primary.main} style={{ marginRight: 10 }} />
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          {actionButtons.map((button, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                onClick={button.onClick}
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: theme.shadows[2],
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette[button.color].main,
                        width: 56,
                        height: 56,
                        mb: 2,
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      {button.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {button.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {button.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
      {renderDashboard()}
      </Box>
    </Container>
  );
}

export default Dashboard; 