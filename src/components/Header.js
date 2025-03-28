import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LogOut,
  User,
  ChevronDown,
  Bell,
  X,
  Settings,
  LayoutDashboard,
  ClipboardCheck,
  Eye,
  Building,
  Users,
  ChevronRight
} from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const { user } = useSelector((state) => state.auth);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});

  // Check current path for active menu items
  const isActivePath = (path) => location.pathname === path;

  // Mock notification count update
  useEffect(() => {
    if (user) {
      // Simulating notification count (would normally come from an API)
      setNotificationsCount(Math.floor(Math.random() * 5));
    }
  }, [user]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
    handleCloseUserMenu();
    setDrawerOpen(false);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Toggle submenu expansion
  const toggleExpand = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Generate menu items based on user role
  const getMenuItems = () => {
    const items = [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard size={20} />,
      },
      {
        title: 'Reports',
        icon: <ClipboardCheck size={20} />,
        submenu: [
          { title: 'Add Report', path: '/add-report' },
          { title: 'View Reports', path: '/view-reports' },
        ],
      },
    ];

    if (user && (user.role === 'admin' || user.role === 'facility_admin')) {
      items.push({
        title: 'Management',
        icon: <Settings size={20} />,
        submenu: [
          { title: 'Departments', path: '/manage-departments', icon: <Building size={18} /> },
          { title: 'Users', path: '/manage-users', icon: <Users size={18} /> },
        ],
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  // Render drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6" component="div">
          MediChain
        </Typography>
        <IconButton 
          color="inherit" 
          onClick={toggleDrawer(false)}
          sx={{ p: 0.5 }}
        >
          <X size={20} color="white" />
        </IconButton>
      </Box>
      
      {user && (
        <Box sx={{ p: 2, bgcolor: theme.palette.primary.light, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: theme.palette.secondary.main,
                mr: 1.5 
              }}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {user.role === 'facility_admin' ? 'Facility Admin' : user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <Divider />
      
      <List sx={{ p: 1 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.submenu ? (
              <>
                <ListItem 
                  button 
                  onClick={() => toggleExpand(item.title)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {expandedItems[item.title] ? 
                    <ChevronDown size={16} /> : 
                    <ChevronRight size={16} />
                  }
                </ListItem>
                <Collapse in={expandedItems[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem, subIndex) => (
                      <ListItem
                        button
                        key={subIndex}
                        onClick={() => {
                          navigate(subItem.path);
                          setDrawerOpen(false);
                        }}
                        sx={{ 
                          pl: 4,
                          py: 0.75,
                          borderRadius: 1,
                          ml: 1,
                          bgcolor: isActivePath(subItem.path) ? 
                            'rgba(0, 0, 0, 0.04)' : 'transparent',
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {subItem.icon || <ChevronRight size={16} />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.title} 
                          primaryTypographyProps={{ 
                            fontSize: '0.95rem',
                            fontWeight: isActivePath(subItem.path) ? 'medium' : 'regular'
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem
                button
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: isActivePath(item.path) ? 
                    'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ 
                    fontWeight: isActivePath(item.path) ? 'medium' : 'regular'
                  }} 
                />
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.08)' : 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: isMobile ? 56 : 64, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <IconButton
                size="large"
                aria-label="menu"
                sx={{ 
                  mr: 1,
                  color: theme.palette.primary.main,
                  display: { md: 'none' } 
                }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon size={24} />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to={user ? '/dashboard' : '/'}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontSize: { xs: '1.2rem', sm: '1.4rem' }
              }}
            >
              MediChain
            </Typography>
          </Box>
          
          {/* Desktop navigation links - only show if user is logged in */}
          {user && (
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' }, 
                justifyContent: 'center',
                ml: 4
              }}
            >
              {menuItems.map((item, index) => (
                item.submenu ? (
                  <Box
                    key={index}
                    sx={{ 
                      position: 'relative',
                      mx: 1,
                      '&:hover .MuiBox-root': {
                        display: 'block',
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 2,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                        fontWeight: 'medium'
                      }}
                    >
                      {item.title}
                      <ChevronDown size={14} style={{ marginLeft: 4 }} />
                    </Box>
                    <Box
                      sx={{
                        display: 'none',
                        position: 'absolute',
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        borderRadius: 1,
                        width: 200,
                        zIndex: 1000,
                        mt: -0.5,
                        overflow: 'hidden',
                      }}
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <MenuItem
                          key={subIndex}
                          component={Link}
                          to={subItem.path}
                          selected={isActivePath(subItem.path)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: '0.9rem',
                            borderBottom: subIndex === item.submenu.length - 1 ? 0 : `1px solid ${theme.palette.divider}`,
                            '&.Mui-selected': {
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              '&:hover': {
                                bgcolor: 'rgba(25, 118, 210, 0.12)',
                              },
                            },
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          {subItem.title}
                        </MenuItem>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography
                    key={index}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActivePath(item.path) 
                        ? theme.palette.primary.main 
                        : 'text.primary',
                      textDecoration: 'none',
                      mx: 1.5,
                      fontWeight: 'medium',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      py: 2,
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                      '&::after': isActivePath(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        bgcolor: theme.palette.primary.main,
                        borderTopLeftRadius: 3,
                        borderTopRightRadius: 3,
                      } : {}
                    }}
                  >
                    {item.title}
                  </Typography>
                )
              ))}
            </Box>
          )}

          {/* Right-side user menu */}
          <Box sx={{ flexGrow: 0, ml: 'auto', display: 'flex', alignItems: 'center' }}>
            {user ? (
              <>
                {/* Notifications - desktop & tablet only */}
                {!isMobile && (
                  <IconButton 
                    sx={{ mr: 1.5 }}
                    aria-label="notifications"
                  >
                    <Badge badgeContent={notificationsCount} color="error">
                      <Bell size={20} />
                    </Badge>
                  </IconButton>
                )}

                {/* User Avatar - desktop & tablet version */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                  <Box
                    onClick={handleOpenUserMenu}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 28,
                      p: 0.5,
                      pr: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: theme.palette.primary.main,
                        mr: 1 
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        mr: 0.5,
                        fontWeight: 'medium',
                        display: { xs: 'none', md: 'block' }
                      }}
                    >
                      {user.name?.split(' ')[0] || 'User'}
                    </Typography>
                    <ChevronDown size={14} />
                  </Box>
                </Box>
                
                {/* Mobile user avatar */}
                <Box sx={{ display: { sm: 'none' } }}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </Box>
                
                {/* User dropdown menu */}
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user.email}
                    </Typography>
                    
                    <Typography variant="caption" color="primary" sx={{ 
                      display: 'inline-block',
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {user.role === 'facility_admin' ? 'Facility Admin' : user.role}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <MenuItem onClick={() => {
                    handleCloseUserMenu();
                    navigate('/profile');
                  }}>
                    <ListItemIcon>
                      <User size={18} />
                    </ListItemIcon>
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  
                  <MenuItem onClick={() => {
                    handleCloseUserMenu();
                    navigate('/settings');
                  }}>
                    <ListItemIcon>
                      <Settings size={18} />
                    </ListItemIcon>
                    <Typography variant="body2">Settings</Typography>
                  </MenuItem>
                  
                  <Divider />
                  
                  <MenuItem 
                    onClick={onLogout}
                    sx={{ color: 'error.main' }}
                  >
                    <ListItemIcon sx={{ color: 'error.main' }}>
                      <LogOut size={18} />
                    </ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Typography
                  component={Link}
                  to="/login"
                  sx={{
                    color: 'text.primary',
                    textDecoration: 'none',
                    mx: 1,
                    fontSize: '0.9rem',
                    fontWeight: 'medium',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Login
                </Typography>
                
                <Typography
                  component={Link}
                  to="/register"
                  sx={{
                    color: 'primary.contrastText',
                    bgcolor: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 'medium',
                    fontSize: '0.9rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  Register
                </Typography>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Drawer for mobile navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '80%',
            maxWidth: 300,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}

export default Header; 