import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext.jsx';
import AssignmentIcon from '@mui/icons-material/Assignment';
import theme from './theme/theme';
import AppLayout from './components/layout/AppLayout';
import MainContent from './components/MainContent';
import BottomNav from './components/navigation/BottomNav';
import TaskEditor from './components/tasks/TaskEditor';
import { useState } from 'react';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <TaskProvider>
            <Router>
              <AppLayout
                title="BuJo"
                icon={AssignmentIcon}
                navigation={<BottomNav onAddClick={() => setIsEditorOpen(true)} />}
              >
                <MainContent />
                <TaskEditor
                  open={isEditorOpen}
                  onClose={() => setIsEditorOpen(false)}
                  task={null}
                />
              </AppLayout>
            </Router>
          </TaskProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;