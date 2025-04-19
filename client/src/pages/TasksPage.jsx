import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TaskList from '../components/tasks/TaskList';
import TaskEditor from '../components/tasks/TaskEditor';
import DateNavigation from '../components/tasks/DateNavigation';
import QuickEntry from '../components/tasks/QuickEntry';
import { useTaskContext } from '../context/TaskContext';

const TasksPage = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const { createTask, updateTask } = useTaskContext();

  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsQuickEntryOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleTaskCreate = async (taskData) => {
    await createTask(taskData);
  };

  const handleTaskUpdate = async (taskId, taskData) => {
    await updateTask(taskId, taskData);
  };

  const handleTaskSave = async (taskData) => {
    if (taskData._id) {
      await handleTaskUpdate(taskData._id, taskData);
    } else {
      await handleTaskCreate(taskData);
    }
    setIsEditorOpen(false);
    setSelectedTask(null);
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 128px)', // Account for header and navigation
      mt: 2,
      mb: 2,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <DateNavigation
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      <TaskList
        onEdit={(task) => {
          setSelectedTask(task);
          setIsEditorOpen(true);
        }}
        currentDate={currentDate}
      />

      <TaskEditor
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
        task={selectedTask}
      />

      <QuickEntry
        open={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
      />
    </Box>
  );
};

export default TasksPage;