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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import CodeIcon from '@mui/icons-material/Code';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({
  title,
  icon: AppIcon,
  navigation,
  children
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
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
      >
        <Box sx={{ width: 250 }}>
          <List>
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