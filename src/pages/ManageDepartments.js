import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  Zoom,
  Fab,
  Chip
} from '@mui/material';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Stethoscope,
  Building2,
  Hospital,
  AlertTriangle
} from 'lucide-react';
import DepartmentForm from '../components/DepartmentForm';

function ManageDepartments() {
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  useEffect(() => {
    fetchDepartments();
    if (user.role === 'super-admin' || user.role === 'state-admin' || user.role === 'district-admin') {
      fetchFacilities();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Add query params based on user role
      let url = '/api/departments';
      if (user.role === 'hospital-admin' && user.facility) {
        url += `?facility=${user.facility}`;
      }

      const response = await axios.get(url, config);
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      const response = await axios.get('/api/facilities', config);
      setFacilities(response.data.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const openDeleteDialog = (department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDepartmentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.delete(`/api/departments/${departmentToDelete._id}`, config);
      
      // Update state
      setDepartments(departments.filter(d => d._id !== departmentToDelete._id));
      toast.success('Department deleted successfully');
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
      closeDeleteDialog();
    }
  };

  const handleFormSuccess = (data) => {
    // Update departments list
    if (selectedDepartment) {
      // Edit case
      setDepartments(departments.map(d => d._id === data._id ? data : d));
      toast.success('Department updated successfully');
    } else {
      // Add case
      setDepartments([...departments, data]);
      toast.success('Department added successfully');
    }
    
    // Reset form state
    setShowForm(false);
    setSelectedDepartment(null);
  };

  const getDepartmentCountByFacility = () => {
    const counts = {};
    departments.forEach(dept => {
      const facilityId = dept.facilityId || 'unknown';
      counts[facilityId] = (counts[facilityId] || 0) + 1;
    });
    return counts;
  };

  const renderAdminDashboard = () => {
    const deptCountsByFacility = getDepartmentCountByFacility();
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2, 
            boxShadow: theme.shadows[3],
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8]
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Stethoscope size={24} style={{ marginRight: '8px', color: theme.palette.primary.main }} /> 
                Department Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Hospital size={18} style={{ marginRight: '8px', color: theme.palette.text.secondary }} />
                  Total Departments: <Typography component="span" sx={{ ml: 1, fontWeight: 600 }}>{departments.length}</Typography>
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Building2 size={18} style={{ marginRight: '8px', color: theme.palette.text.secondary }} />
                  Active Facilities: <Typography component="span" sx={{ ml: 1, fontWeight: 600 }}>{Object.keys(deptCountsByFacility).length}</Typography>
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                fullWidth
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowForm(true);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  boxShadow: theme.shadows[2],
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                Add New Department
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: theme.shadows[6]
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <Building2 size={24} style={{ marginRight: '8px', color: theme.palette.primary.main }} /> 
                Departments by Facility
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {facilities.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Facility Name</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Department Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {facilities.map(facility => (
                        <TableRow key={facility._id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{facility.name}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={deptCountsByFacility[facility._id] || 0} 
                              color={deptCountsByFacility[facility._id] ? 'primary' : 'default'}
                              size="small"
                              sx={{ borderRadius: '8px', fontWeight: 'bold', minWidth: '28px' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No facilities available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Manage Departments
        </Typography>

        {/* Admin Dashboard - only for admins */}
        {(user.role === 'super-admin' || user.role === 'state-admin' || user.role === 'district-admin' || user.role === 'hospital-admin') && renderAdminDashboard()}

        {/* Department Form Dialog */}
        <Dialog 
          open={showForm} 
          onClose={() => {
            setShowForm(false);
            setSelectedDepartment(null);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
          TransitionComponent={Zoom}
          transitionDuration={300}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedDepartment ? 'Edit Department' : 'Add New Department'}</Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={() => {
                setShowForm(false);
                setSelectedDepartment(null);
              }}
              aria-label="close"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'rotate(90deg)' }
              }}
            >
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DepartmentForm 
              department={selectedDepartment} 
              onSuccess={handleFormSuccess} 
              facilities={facilities}
              userRole={user.role}
              userFacility={user.facility}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
          TransitionComponent={Zoom}
          transitionDuration={300}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <AlertTriangle size={22} color={theme.palette.error.main} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the department "{departmentToDelete?.name}"? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              startIcon={<Trash2 size={18} />}
              sx={{ borderRadius: '8px' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Departments List */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Hospital size={22} color={theme.palette.primary.main} />
              Departments List
            </Typography>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowForm(true);
                }}
                sx={{
                  borderRadius: '10px',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add Department
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={isMobile ? 40 : 60} />
            </Box>
          ) : departments.length > 0 ? (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>}
                    {!isMobile && !isTablet && user.role !== 'hospital-admin' && (
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Facility</TableCell>
                    )}
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept._id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {dept.name}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {dept.description ? (
                            <Typography variant="body2" 
                              sx={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxWidth: { xs: '150px', sm: '300px', md: 'auto' }
                              }}
                            >
                              {dept.description}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No description available
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      {!isMobile && !isTablet && user.role !== 'hospital-admin' && (
                        <TableCell>
                          {dept.facility?.name || 'Not assigned'}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit Department" arrow>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit(dept)}
                              sx={{ 
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' } 
                              }}
                            >
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Department" arrow>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(dept)}
                              sx={{ 
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' } 
                              }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2, 
                  borderRadius: '10px',
                  '& .MuiAlert-icon': { fontSize: 28 }
                }}
              >
                No departments found.
              </Alert>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowForm(true);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add Your First Department
              </Button>
            </Box>
          )}

          {isMobile && departments.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                fullWidth
                onClick={() => {
                  setSelectedDepartment(null);
                  setShowForm(true);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add Department
              </Button>
            </Box>
          )}
        </Paper>
        
        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Zoom in={!showForm}>
            <Fab 
              color="primary" 
              aria-label="add department"
              onClick={() => {
                setSelectedDepartment(null);
                setShowForm(true);
              }}
              sx={{ 
                position: 'fixed', 
                bottom: 20, 
                right: 20,
                boxShadow: theme.shadows[8]
              }}
            >
              <Plus size={22} />
            </Fab>
          </Zoom>
        )}
      </Box>
    </Container>
  );
}

export default ManageDepartments; 