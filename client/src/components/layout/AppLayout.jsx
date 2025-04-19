import { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CodeIcon from '@mui/icons-material/Code';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppLayout = ({
  title,
  icon: AppIcon,
  navigation,
  children
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { label: 'All', icon: ViewListIcon, path: '/tasks/all' },
    { label: 'Daily', icon: CalendarTodayIcon, path: '/tasks/daily' },
    { label: 'Weekly', icon: CalendarViewWeekIcon, path: '/tasks/weekly' },
    { label: 'Monthly', icon: CalendarViewMonthIcon, path: '/tasks/monthly' },
    { label: 'Year', icon: ViewModuleIcon, path: '/tasks/year' },
    { label: 'Backlog', icon: ViewListIcon, path: '/tasks/backlog' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {AppIcon && (
            <AppIcon sx={{ ml: 2, mr: 1 }} />
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}Geek <Typography component="span" sx={{ opacity: 0.7 }}>{'/>'}</Typography>
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            marginTop: '64px' // Height of the AppBar
          }
        }}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider />
            <ListItem button onClick={() => {
              navigate('/templates');
              setDrawerOpen(false);
            }}>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText primary="Templates" />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        {navigation}
      </Box>
    </Box>
  );
};

export default AppLayout;