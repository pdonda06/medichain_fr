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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Tooltip,
  Chip,
  Pagination,
  Card,
  CardContent,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Zoom,
  Fab,
  Avatar
} from '@mui/material';
import {
  UserPlus,
  Edit,
  Trash2,
  X,
  SlidersHorizontal,
  RefreshCw,
  UserCog,
  User,
  Search,
  Key,
  AtSign,
  BadgeCheck,
  AlertTriangle,
  Users,
  Eraser
} from 'lucide-react';

function ManageUsers() {
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'department-user',
    facility: '',
    department: '',
    district: '',
    state: ''
  });
  
  const [filters, setFilters] = useState({
    role: '',
    facility: '',
    district: '',
    state: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [showFilters, setShowFilters] = useState(!isMobile);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
    if (user.role !== 'department-user') {
      fetchFacilities();
    }
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      // Build query string from filters
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;
      
      if (filters.role) queryParams += `&role=${filters.role}`;
      if (filters.facility) queryParams += `&facility=${filters.facility}`;
      if (filters.district) queryParams += `&district=${filters.district}`;
      if (filters.state) queryParams += `&state=${filters.state}`;

      const response = await axios.get(`/api/users?${queryParams}`, config);
      
      setUsers(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
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

  const handleEdit = (userData) => {
    // Prepare form data for editing
    const editData = {
      name: userData.name || '',
      email: userData.email || '',
      password: '',
      confirmPassword: '',
      role: userData.role || 'department-user',
      facility: userData.facility || '',
      department: userData.department || '',
      district: userData.district || '',
      state: userData.state || ''
    };
    
    setFormData(editData);
    setSelectedUser(userData);
    setShowForm(true);
    
    // Fetch departments if facility is selected
    if (userData.facility) {
      fetchDepartmentsForFacility(userData.facility);
    }
  };

  const openDeleteDialog = (userData) => {
    setUserToDelete(userData);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.delete(`/api/users/${userToDelete._id}`, config);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      toast.success('User deleted successfully');
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
      closeDeleteDialog();
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

  const resetFilters = () => {
    setFilters({
      role: '',
      facility: '',
      district: '',
      state: ''
    });
    
    // Reset to first page
    setPagination({ ...pagination, page: 1 });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear form error when user makes changes
    if (formError) setFormError('');
    
    // Fetch departments when facility changes
    if (name === 'facility') {
      fetchDepartmentsForFacility(value);
      // Reset department selection
      setFormData(prev => ({ ...prev, department: '' }));
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.role) {
      setFormError('Please fill in all required fields');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    // Check password for new users or if password is being changed
    if (!selectedUser || (formData.password && formData.password.length > 0)) {
      if (!formData.password) {
        setFormError('Password is required');
        return false;
      }
      
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }
    
    // Role-specific validations
    if ((formData.role === 'hospital-admin' || formData.role === 'department-user') && !formData.facility) {
      setFormError('Please select a facility');
      return false;
    }
    
    if (formData.role === 'department-user' && !formData.department) {
      setFormError('Please select a department');
      return false;
    }
    
    if (formData.role === 'district-admin' && !formData.district) {
      setFormError('Please select a district');
      return false;
    }
    
    if (formData.role === 'state-admin' && !formData.state) {
      setFormError('Please select a state');
      return false;
    }
    
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Prepare data for API
      const userData = { ...formData };
      
      // Don't send password if it's empty (for edit)
      if (!userData.password) {
        delete userData.password;
      }
      
      // Remove confirmPassword as it's not needed by the API
      delete userData.confirmPassword;
      
      if (selectedUser) {
        // Update existing user
        await axios.put(`/api/users/${selectedUser._id}`, userData, config);
        
        // Update users list
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...userData } : u));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const response = await axios.post('/api/users', userData, config);
        
        // Add new user to list
        setUsers([...users, response.data]);
        toast.success('User created successfully');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'department-user',
        facility: '',
        department: '',
        district: '',
        state: ''
      });
      
      setSelectedUser(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin':
        return 'error';
      case 'state-admin':
        return 'warning';
      case 'district-admin':
        return 'info';
      case 'hospital-admin':
        return 'secondary';
      case 'department-user':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super-admin':
      case 'state-admin':
      case 'district-admin':
      case 'hospital-admin':
        return <UserCog size={22} />;
      case 'department-user':
        return <User size={22} />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'state-admin':
        return 'State Admin';
      case 'district-admin':
        return 'District Admin';
      case 'hospital-admin':
        return 'Hospital Admin';
      case 'department-user':
        return 'Department User';
      default:
        return role;
    }
  };

  const getAvailableRoles = () => {
    // Return roles based on the user's role
    const roles = [];
    
    switch(user.role) {
      case 'super-admin':
        roles.push(
          { value: 'super-admin', label: 'Super Admin' },
          { value: 'state-admin', label: 'State Admin' },
          { value: 'district-admin', label: 'District Admin' },
          { value: 'hospital-admin', label: 'Hospital Admin' },
          { value: 'department-user', label: 'Department User' }
        );
        break;
      case 'state-admin':
        roles.push(
          { value: 'district-admin', label: 'District Admin' },
          { value: 'hospital-admin', label: 'Hospital Admin' },
          { value: 'department-user', label: 'Department User' }
        );
        break;
      case 'district-admin':
        roles.push(
          { value: 'hospital-admin', label: 'Hospital Admin' },
          { value: 'department-user', label: 'Department User' }
        );
        break;
      case 'hospital-admin':
        roles.push(
          { value: 'department-user', label: 'Department User' }
        );
        break;
      default:
        break;
    }
    
    return roles;
  };

  const renderUserStats = () => {
    // Calculate stats based on available users
    const totalUsers = users.length;
    const roleCount = {};
    
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    const statsCards = [
      { 
        title: 'Total Users', 
        count: totalUsers,
        color: 'primary',
        icon: <Users size={28} />
      }
    ];
    
    // Add role-based stats
    ['super-admin', 'state-admin', 'district-admin', 'hospital-admin', 'department-user'].forEach(role => {
      if (roleCount[role]) {
        statsCards.push({
          title: getRoleLabel(role),
          count: roleCount[role],
          color: getRoleColor(role),
          icon: getRoleIcon(role)
        });
      }
    });
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  sx={{ 
                    mx: 'auto',
                    bgcolor: `${stat.color}.main`,
                    mb: 2,
                    width: 56,
                    height: 56,
                    boxShadow: theme.shadows[3]
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h3" color={`${stat.color}.main`} sx={{ fontWeight: 'bold' }}>
                  {stat.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Users color={theme.palette.primary.main} size={32} />
          Manage Users
        </Typography>

        {/* User Stats Dashboard */}
        {user.role !== 'department-user' && users.length > 0 && renderUserStats()}

        {/* User Form Dialog */}
        <Dialog
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(null);
            setFormData({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: 'department-user',
              facility: '',
              department: '',
              district: '',
              state: ''
            });
            setFormError('');
          }}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
          TransitionComponent={Zoom}
          transitionDuration={300}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedUser ? <Edit size={22} color={theme.palette.primary.main} /> : <UserPlus size={22} color={theme.palette.primary.main} />}
              <Typography variant="h6">{selectedUser ? 'Edit User' : 'Add New User'}</Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => {
                setShowForm(false);
                setSelectedUser(null);
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
            {formError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                {formError}
              </Alert>
            )}

            <form onSubmit={onSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name *"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    required
                    InputProps={{
                      startAdornment: <BadgeCheck size={20} style={{ marginRight: '8px', color: theme.palette.action.active }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    InputProps={{
                      startAdornment: <AtSign size={20} style={{ marginRight: '8px', color: theme.palette.action.active }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={selectedUser ? "Password (leave blank to keep current)" : "Password *"}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={onChange}
                    required={!selectedUser}
                    helperText={selectedUser ? "Only enter if changing password" : "Minimum 6 characters"}
                    InputProps={{
                      startAdornment: <Key size={20} style={{ marginRight: '8px', color: theme.palette.action.active }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={onChange}
                    required={!selectedUser || formData.password.length > 0}
                    InputProps={{
                      startAdornment: <Key size={20} style={{ marginRight: '8px', color: theme.palette.action.active }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={onChange}
                      label="Role *"
                      required
                      startAdornment={<UserCog size={20} style={{ marginRight: '8px', color: theme.palette.action.active }} />}
                    >
                      {getAvailableRoles().map(role => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {(formData.role === 'hospital-admin' || formData.role === 'department-user') && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Facility *</InputLabel>
                      <Select
                        name="facility"
                        value={formData.facility}
                        onChange={onChange}
                        label="Facility *"
                        required
                      >
                        {facilities.map(facility => (
                          <MenuItem key={facility._id} value={facility._id}>
                            {facility.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {formData.role === 'department-user' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Department *</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={onChange}
                        label="Department *"
                        required
                        disabled={!formData.facility || departments.length === 0}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {formData.role === 'district-admin' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="District *"
                      name="district"
                      value={formData.district}
                      onChange={onChange}
                      required
                    />
                  </Grid>
                )}

                {formData.role === 'state-admin' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State *"
                      name="state"
                      value={formData.state}
                      onChange={onChange}
                      required
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedUser(null);
                  }}
                  sx={{ 
                    mr: 1, 
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                  startIcon={<X size={18} />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={selectedUser ? <Edit size={18} /> : <UserPlus size={18} />}
                  sx={{ 
                    borderRadius: '10px',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  {selectedUser ? 'Update User' : 'Create User'}
                </Button>
              </Box>
            </form>
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
              Are you sure you want to delete the user "{userToDelete?.name}"? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={closeDeleteDialog} 
              color="primary"
              startIcon={<X size={18} />}
              sx={{ borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              startIcon={<Trash2 size={18} />}
              sx={{ borderRadius: '10px' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filters Card */}
        <Card sx={{ mb: 4, borderRadius: 2, overflow: 'visible', boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SlidersHorizontal size={20} color={theme.palette.primary.main} />
                User Filters
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<SlidersHorizontal size={18} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<Eraser size={18} />}
                  onClick={resetFilters}
                >
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<RefreshCw size={18} />}
                  onClick={fetchUsers}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>

            {showFilters && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      label="Role"
                      startAdornment={<UserCog size={18} style={{ marginRight: '8px', color: theme.palette.action.active }} />}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      {getAvailableRoles().map(role => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Facility</InputLabel>
                    <Select
                      name="facility"
                      value={filters.facility}
                      onChange={handleFilterChange}
                      label="Facility"
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
                
                {user.role === 'super-admin' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="District"
                      name="district"
                      value={filters.district}
                      onChange={handleFilterChange}
                      size="small"
                    />
                  </Grid>
                )}
                
                {user.role === 'super-admin' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={filters.state}
                      onChange={handleFilterChange}
                      size="small"
                    />
                  </Grid>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Add User Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={() => {
              setSelectedUser(null);
              setShowForm(true);
            }}
            sx={{ 
              borderRadius: '10px',
              py: 1.2,
              px: 3,
              boxShadow: theme.shadows[3],
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            Add New User
          </Button>
        </Box>

        {/* Users List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={isMobile ? 40 : 60} />
          </Box>
        ) : users.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
              <Table sx={{ minWidth: isMobile ? 450 : 650 }}>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>}
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                    {!isMobile && !isTablet && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Facility/Dept</TableCell>}
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{userData.name}</TableCell>
                      {!isMobile && <TableCell>{userData.email}</TableCell>}
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(userData.role)}
                          label={getRoleLabel(userData.role)}
                          color={getRoleColor(userData.role)}
                          size="small"
                          sx={{ borderRadius: '8px', fontWeight: 500 }}
                        />
                      </TableCell>
                      {!isMobile && !isTablet && (
                        <TableCell>
                          <Box>
                            {userData.facilityName ? (
                              <>
                                <Typography variant="body2" component="span">
                                  {userData.facilityName}
                                </Typography>
                                {userData.departmentName && (
                                  <Typography variant="body2" color="text.secondary">
                                    {userData.departmentName}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                {userData.district || userData.state || 'Not assigned'}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit User" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(userData)}
                              sx={{ 
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' } 
                              }}
                            >
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          {userData._id !== user._id && (
                            <Tooltip title="Delete User" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(userData)}
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.1)' } 
                                }}
                              >
                                <Trash2 size={18} />
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
                Showing {users.length} of {pagination.total} users
              </Typography>
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', boxShadow: theme.shadows[3] }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No users found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {Object.values(filters).some(value => value !== '')
                ? 'Try adjusting your filters or create a new user.'
                : 'Create your first user to get started.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={() => {
                setSelectedUser(null);
                setShowForm(true);
              }}
              size="large"
              sx={{ 
                borderRadius: '10px',
                py: 1.5,
                px: 4,
                boxShadow: theme.shadows[3],
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Add New User
            </Button>
          </Paper>
        )}
        
        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Zoom in={!showForm}>
            <Fab 
              color="primary" 
              aria-label="add user"
              onClick={() => {
                setSelectedUser(null);
                setShowForm(true);
              }}
              sx={{ 
                position: 'fixed', 
                bottom: 20, 
                right: 20,
                boxShadow: theme.shadows[8]
              }}
            >
              <UserPlus size={22} />
            </Fab>
          </Zoom>
        )}
      </Box>
    </Container>
  );
}

export default ManageUsers; 