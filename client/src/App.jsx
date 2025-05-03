import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext.jsx';
import theme from './theme/theme';
import AppLayout from './components/layout/AppLayout';
import MainContent from './components/MainContent';
import BottomNav from './components/navigation/BottomNav';
import TaskEditor from './components/tasks/TaskEditor';
import { CheckBoxOutlined as CheckBoxIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

function AppWithAuth() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { user } = useAuth();

  return (
    <AppLayout
      icon={CheckBoxIcon}
      navigation={user ? <BottomNav onAddClick={() => setIsEditorOpen(true)} /> : null}
    >
      <MainContent />
      <TaskEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        task={null}
      />
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <TaskProvider>
            <Router>
              <AppWithAuth />
            </Router>
          </TaskProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;