import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Eye, 
  Users, 
  Building2, 
  Menu, 
  X,
  LogOut,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import useResponsive from '../hooks/useResponsive';
import { logout } from '../features/auth/authSlice';

const MobileNavigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isMobile } = useResponsive();
  const [value, setValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isFacilityAdmin = user?.role === 'facility_admin';

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      { label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
      { label: 'Add Report', icon: <ClipboardList size={22} />, path: '/add-report' },
      { label: 'View Reports', icon: <Eye size={22} />, path: '/view-reports' },
    ];

    if (isAdmin || isFacilityAdmin) {
      items.push(
        { label: 'Departments', icon: <Building2 size={22} />, path: '/manage-departments' },
        { label: 'Users', icon: <Users size={22} />, path: '/manage-users' }
      );
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  // Find active route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = navigationItems.findIndex(item => item.path === currentPath);
    if (activeIndex !== -1) {
      setValue(activeIndex);
    }
  }, [location.pathname, navigationItems]);

  // Handle navigation
  const handleNavigation = (event, newValue) => {
    setValue(newValue);
    navigate(navigationItems[newValue].path);
  };

  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDrawerOpen(false);
  };

  // Additional menu items for drawer
  const drawerItems = [
    { label: 'Settings', icon: <Settings size={20} />, action: () => navigate('/settings') },
    { label: 'Help', icon: <HelpCircle size={20} />, action: () => navigate('/help') },
    { label: 'Logout', icon: <LogOut size={20} />, action: handleLogout },
  ];

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
          boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <BottomNavigation
          value={value}
          onChange={handleNavigation}
          showLabels
          sx={{
            height: 60,
            '& .MuiBottomNavigationAction-root': {
              padding: '6px 0',
              minWidth: 0,
              maxWidth: '100%',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          {navigationItems.slice(0, 4).map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.label}
              icon={item.icon}
              sx={{
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  marginTop: '4px',
                  '&.Mui-selected': {
                    fontSize: '0.75rem',
                  },
                },
              }}
            />
          ))}
          
          {/* Menu Button for More Options */}
          <BottomNavigationAction
            label="More"
            icon={
              <Badge badgeContent={notifications} color="error">
                <Menu size={22} />
              </Badge>
            }
            onClick={toggleDrawer(true)}
          />
        </BottomNavigation>
      </Paper>

      {/* Drawer for More Options */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '75%',
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Menu
          </Typography>
          <IconButton onClick={toggleDrawer(false)}>
            <X size={20} />
          </IconButton>
        </Box>
        
        <Divider />
        
        {/* User Info */}
        <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2">
            {user?.email || 'user@example.com'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'ROLE'}
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Navigation Items that didn't fit in bottom nav */}
        <List>
          {navigationItems.length > 4 && navigationItems.slice(4).map((item, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          
          {/* Notification Center */}
          <ListItem button onClick={() => setDrawerOpen(false)}>
            <ListItemIcon>
              <Badge badgeContent={notifications} color="error">
                <Bell size={20} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
        </List>
        
        <Divider />
        
        {/* Additional Options */}
        <List>
          {drawerItems.map((item, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={item.action}
              sx={{
                color: item.label === 'Logout' ? 'error.main' : 'inherit',
              }}
            >
              <ListItemIcon sx={{
                color: item.label === 'Logout' ? 'error.main' : 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Space to ensure content isn't hidden behind the bottom navigation */}
      <Box sx={{ height: { xs: 60, sm: 0 } }} />
    </>
  );
};

export default MobileNavigation; 