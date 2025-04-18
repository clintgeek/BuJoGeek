import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskEditor from '../components/tasks/TaskEditor';

const TasksPage = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsEditorOpen(true)}
        >
          New Task
        </Button>
      </Box>

      <TaskFilters />
      <Box sx={{ mt: 3 }}>
        <TaskList />
      </Box>

      <TaskEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </Box>
  );
};

export default TasksPage;