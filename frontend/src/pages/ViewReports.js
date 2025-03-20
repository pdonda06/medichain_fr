import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Pagination,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Tooltip,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Eye,
  Edit,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  X,
  Download,
  Settings
} from 'lucide-react';

function ViewReports() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: '',
    quarter: '',
    facility: '',
    department: '',
    status: ''
  });
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(!isMobile);

  useEffect(() => {
    fetchReports();
    fetchFacilities();
    fetchDepartments();
  }, [pagination.page, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Build query string from filters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;
      
      if (filters.year) queryParams += `&year=${filters.year}`;
      if (filters.month) queryParams += `&month=${filters.month}`;
      if (filters.quarter) queryParams += `&quarter=${filters.quarter}`;
      if (filters.facility) queryParams += `&facility=${filters.facility}`;
      if (filters.department) queryParams += `&department=${filters.department}`;
      if (filters.status) queryParams += `&status=${filters.status}`;

      const response = await axios.get(`/api/health-data?${queryParams}`, config);
      
      setReports(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    if (user.role === 'department-user') return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Filter facilities based on user role
      let url = '/api/facilities';
      if (user.role === 'hospital-admin') {
        url += `?_id=${user.facility}`;
      } else if (user.role === 'district-admin') {
        url += `?district=${user.district}`;
      } else if (user.role === 'state-admin') {
        url += `?state=${user.state}`;
      }

      const response = await axios.get(url, config);
      setFacilities(response.data.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchDepartments = async () => {
    if (user.role === 'department-user') return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Filter departments based on user role and selected facility
      let url = '/api/departments';
      if (user.role === 'hospital-admin') {
        url += `?facility=${user.facility}`;
      } else if (filters.facility) {
        url += `?facility=${filters.facility}`;
      }

      const response = await axios.get(url, config);
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters({
      ...filters,
      [name]: value
    });

    // Reset pagination when filters change
    setPagination({
      ...pagination,
      page: 1
    });

    // Fetch departments when facility changes
    if (name === 'facility') {
      fetchDepartmentsForFacility(value);
    }
  };

  const fetchDepartmentsForFacility = async (facilityId) => {
    if (!facilityId) {
      setDepartments([]);
      return;
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(`/api/departments?facility=${facilityId}`, config);
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments for facility:', error);
    }
  };

  const resetFilters = () => {
    setFilters({
      year: new Date().getFullYear(),
      month: '',
      quarter: '',
      facility: '',
      department: '',
      status: ''
    });
    
    // Reset to first page
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (event, newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'primary';
      case 'reviewed':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFormattedPeriod = (report) => {
    if (report.reportingPeriod) {
      if (report.reportingPeriod.quarter) {
        return `Q${report.reportingPeriod.quarter} ${report.reportingPeriod.year}`;
      } else if (report.reportingPeriod.month) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[report.reportingPeriod.month - 1]} ${report.reportingPeriod.year}`;
      } else {
        return report.reportingPeriod.year;
      }
    }
    return 'N/A';
  };

  const refreshReports = () => {
    fetchReports();
    toast.info('Reports refreshed');
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        await axios.delete(`/api/health-data/${reportId}`, config);
        toast.success('Report deleted successfully');
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        toast.error('Failed to delete report');
      }
    }
  };

  const handleEditReport = (reportId) => {
    navigate(`/edit-report/${reportId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          View Health Reports
        </Typography>

        <Card sx={{ 
          mb: 5, 
          borderRadius: 2, 
          overflow: 'visible', 
          boxShadow: theme.shadows[3],
          transition: 'all 0.3s ease'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings size={20} color={theme.palette.primary.main} />
                Filters
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1} 
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  '& button': { width: { xs: '100%', sm: 'auto' } }  
                }}
              >
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<SlidersHorizontal size={18} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ display: { xs: 'flex', md: 'none'} }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<X size={18} />}
                  onClick={resetFilters}
                >
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<RefreshCw size={18} />}
                  onClick={refreshReports}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>

            {showFilters && (
              <Box 
                sx={{ 
                  mt: 2,
                  transition: 'all 0.3s ease',
                  height: showFilters ? 'auto' : 0,
                  
                }}
              >
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  {/* Year filter */}
                  {/* <p>Year</p> */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                      fullWidth
                      label="Year"                      name="year"
                      type="number"
                      value={filters.year}
                      onChange={handleFilterChange}
                      variant="outlined"
                      size={isMobile ? "small" : "small"}
                      InputProps={{
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                  
                  {/* Month filter */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl fullWidth size={isMobile ? "small" : "small"}>
                      <InputLabel>Month</InputLabel>
                      <Select
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                        label="Month"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="">All Months</MenuItem>
                        <MenuItem value="1">January</MenuItem>
                        <MenuItem value="2">February</MenuItem>
                        <MenuItem value="3">March</MenuItem>
                        <MenuItem value="4">April</MenuItem>
                        <MenuItem value="5">May</MenuItem>
                        <MenuItem value="6">June</MenuItem>
                        <MenuItem value="7">July</MenuItem>
                        <MenuItem value="8">August</MenuItem>
                        <MenuItem value="9">September</MenuItem>
                        <MenuItem value="10">October</MenuItem>
                        <MenuItem value="11">November</MenuItem>
                        <MenuItem value="12">December</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Quarter filter */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl fullWidth size={isMobile ? "small" : "small"}>
                      <InputLabel>Quarter</InputLabel>
                      <Select
                        name="quarter"
                        value={filters.quarter}
                        onChange={handleFilterChange}
                        label="Quarter"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="">All Quarters</MenuItem>
                        <MenuItem value="1">Q1</MenuItem>
                        <MenuItem value="2">Q2</MenuItem>
                        <MenuItem value="3">Q3</MenuItem>
                        <MenuItem value="4">Q4</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Status filter */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl fullWidth size={isMobile ? "small" : "small"}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        label="Status"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="submitted">Submitted</MenuItem>
                        <MenuItem value="reviewed">Reviewed</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Facility filter */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl fullWidth size={isMobile ? "small" : "small"}>
                      <InputLabel>Facility</InputLabel>
                      <Select
                        name="facility"
                        value={filters.facility}
                        onChange={handleFilterChange}
                        label="Facility"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="">All Facilities</MenuItem>
                        {facilities.map(facility => (
                          <MenuItem key={facility._id} value={facility._id}>
                            {facility.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Department filter */}
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl fullWidth size={isMobile ? "small" : "small"}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        label="Department"
                        disabled={!filters.facility && departments.length === 0}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map(dept => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                {/* Show active filters on mobile */}
                {isMobile && Object.values(filters).some(value => value !== '' && value !== null) && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.year && (
                      <Chip 
                        label={`Year: ${filters.year}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => setFilters({...filters, year: new Date().getFullYear()})}
                      />
                    )}
                    {filters.month && (
                      <Chip 
                        label={`Month: ${new Date(0, filters.month - 1).toLocaleString('default', { month: 'long' })}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => setFilters({...filters, month: ''})}
                      />
                    )}
                    {filters.quarter && (
                      <Chip 
                        label={`Q${filters.quarter}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => setFilters({...filters, quarter: ''})}
                      />
                    )}
                    {filters.status && (
                      <Chip 
                        label={`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => setFilters({...filters, status: ''})}
                      />
                    )}
                    {filters.facility && facilities.length > 0 && (
                      <Chip 
                        label={`Facility: ${facilities.find(f => f._id === filters.facility)?.name || ''}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => {
                          setFilters({...filters, facility: '', department: ''});
                          setDepartments([]);
                        }}
                      />
                    )}
                    {filters.department && departments.length > 0 && (
                      <Chip 
                        label={`Dept: ${departments.find(d => d._id === filters.department)?.name || ''}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={() => setFilters({...filters, department: ''})}
                      />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={isMobile ? 40 : 60} />
          </Box>
        ) : reports.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <Table aria-label="reports table">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Period</TableCell>
                    {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Facility</TableCell>}
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                    {!isMobile && !isTablet && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submitted</TableCell>}
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>{getFormattedPeriod(report)}</TableCell>
                      {!isMobile && <TableCell>{report.facility?.name || 'N/A'}</TableCell>}
                      <TableCell>{report.department?.name || 'N/A'}</TableCell>
                      {!isMobile && !isTablet && <TableCell>{formatDate(report.submittedAt || report.createdAt)}</TableCell>}
                      <TableCell>
                        <Chip 
                          label={report.status.charAt(0).toUpperCase() + report.status.slice(1)} 
                          color={getStatusColor(report.status)}
                          size="small"
                          sx={{ fontWeight: 500, borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Report" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/report/${report._id}`)}
                              sx={{ 
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' } 
                              }}
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                          
                          {(report.status === 'draft' || user.role === 'super-admin') && (
                            <Tooltip title="Edit Report" arrow>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleEditReport(report._id)}
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.1)' } 
                                }}
                              >
                                <Edit size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(report.status === 'draft' || user.role === 'super-admin') && (
                            <Tooltip title="Delete Report" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteReport(report._id)}
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.1)' } 
                                }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {report.status === 'approved' && (
                            <Tooltip title="Download Report" arrow>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => navigate(`/download/${report._id}`)}
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.1)' } 
                                }}
                              >
                                <Download size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px'
                  } 
                }}
              />
            </Box>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {reports.length} of {pagination.total} reports
              </Typography>
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', boxShadow: theme.shadows[3] }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No reports found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {Object.values(filters).some(value => value !== '' && value !== null) 
                ? 'Try adjusting your filters or create a new report.'
                : 'Create your first health data report.'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/add-report')}
              size="large"
              sx={{ 
                borderRadius: '8px',
                px: 4,
                py: 1.5,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[8] }
              }}
            >
              Create New Report
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default ViewReports; 