import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);
  const [errorObj, setErrorObj] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorObj(null);

    try {
      await login({ email, password });
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login');
      setErrorObj(err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <IconButton
            size="small"
            onClick={() => setDebugOpen((open) => !open)}
            sx={{ ml: 1 }}
          >
            {debugOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Alert>
      )}
      <Collapse in={debugOpen && !!error}>
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2, fontSize: '0.85em' }}>
          <Typography variant="subtitle2">Debug Info</Typography>
          <div><b>API URL:</b> {API_URL}</div>
          {errorObj && (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
              {JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj), 2)}
            </pre>
          )}
        </Box>
      </Collapse>

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
      >
        Login
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Link href="/register" underline="hover">
          Register
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;