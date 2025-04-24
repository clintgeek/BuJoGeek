import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import TaskList from '../components/tasks/TaskList';
import TaskEditor from '../components/tasks/TaskEditor';
import DateNavigation from '../components/tasks/DateNavigation';
import QuickEntry from '../components/tasks/QuickEntry';
import WeeklyLog from '../components/weekly/WeeklyLog';
import MonthlyLog from '../components/monthly/MonthlyLog';
import YearlyLog from '../components/yearly/YearlyLog';
import { useTaskContext } from '../context/TaskContext';
import TaskCreatorWithDates from '../components/tasks/TaskCreatorWithDates';

const TasksPage = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const { createTask, updateTask, fetchTasks, fetchDailyTasks, fetchWeeklyTasks, fetchMonthlyTasks, fetchYearlyTasks, fetchAllTasks } = useTaskContext();
  const location = useLocation();
  const view = location.pathname.split('/')[2] || 'daily';
  const initialLoadRef = useRef({});

  useEffect(() => {
    // Always fetch for daily view or when switching views
    if (view === 'daily' || !initialLoadRef.current[view]) {
      // Mark this view as loaded
      initialLoadRef.current[view] = true;

      if (view === 'all') {
        fetchAllTasks();
        return;
      }

      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      switch (view) {
        case 'daily':
          fetchDailyTasks(currentDate);
          break;
        case 'weekly':
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          fetchWeeklyTasks(weekStart, weekEnd);
          break;
        case 'monthly':
          const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          fetchMonthlyTasks(monthStart, monthEnd);
          break;
        case 'year':
          const yearStart = new Date(currentDate.getFullYear(), 0, 1);
          const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
          fetchYearlyTasks(yearStart, yearEnd);
          break;
        case 'backlog':
          fetchTasks();
          break;
      }
    }
  }, [view, currentDate]); // Added currentDate as dependency

  // Reset initialLoad when view changes
  useEffect(() => {
    return () => {
      initialLoadRef.current = {};
    };
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

  const renderView = () => {
    switch (view) {
      case 'weekly':
        return <WeeklyLog />;
      case 'monthly':
        return <MonthlyLog />;
      case 'year':
        return <YearlyLog />;
      default:
        return (
          <>
            {view !== 'all' && (
              <DateNavigation
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            )}
            <TaskList
              onEdit={(task) => {
                setSelectedTask(task);
                setIsEditorOpen(true);
              }}
              currentDate={currentDate}
            />
          </>
        );
    }
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 175px)', // Account for header and navigation
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* <TaskCreatorWithDates /> */}
      {renderView()}

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