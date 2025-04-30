import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton } from '@mui/material';
import { Link, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TasksPage from '../pages/TasksPage';
import TemplatesPage from '../pages/TemplatesPage';
import QuickEntry from './tasks/QuickEntry';
import ProtectedRoute from './ProtectedRoute';
import { useState, useEffect } from 'react';
import { Menu as MenuIcon, CheckBox as CheckBoxIcon } from '@mui/icons-material';

const MainContent = () => {
  const { user, logout } = useAuth();
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopPropagation();
        setQuickEntryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress, true);
    return () => window.removeEventListener('keydown', handleKeyPress, true);
  }, []);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppBar position="fixed">
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 700,
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CheckBoxIcon sx={{ fontSize: 24 }} />
            BuJoGeek
            <span style={{ fontFamily: 'monospace', fontSize: '16px' }}>MARKER &lt;/&gt;</span>
          </Typography>

          {user ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/tasks"
                sx={{ mx: 1 }}
              >
                Tasks
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/templates"
                sx={{ mx: 1 }}
              >
                Templates
              </Button>
              <Button
                color="inherit"
                onClick={logout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ mx: 1 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/register"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* Spacer for fixed AppBar */}

      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <Box sx={{
              textAlign: 'center',
              mt: { xs: 4, sm: 8 }
            }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontWeight: 700
                }}
              >
                BuJoGeek
              </Typography>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                color="text.secondary"
              >
                Digital Bullet Journal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Part of GeekSuite
              </Typography>
            </Box>
          } />
          <Route path="/tasks/*" element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
          <Route path="/templates/*" element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Container>

      {user && <QuickEntry open={quickEntryOpen} onClose={() => setQuickEntryOpen(false)} />}
    </Box>
  );
};

export default MainContent;