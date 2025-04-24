import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Error types for better error handling
const TaskError = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Loading states for different operations
export const LoadingState = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  CREATING: 'creating',
  UPDATING: 'updating',
  DELETING: 'deleting',
  MIGRATING: 'migrating'
};

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

const TaskProvider = ({ children }) => {
  // Main state
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(LoadingState.IDLE);
  const [error, setError] = useState(null);
  const fetchTimeoutRef = useRef(null);
  const lastFetchRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    signifier: '',
    tags: []
  });

  // Helper function to handle API errors
  const handleApiError = useCallback((error) => {
    let errorType = TaskError.UNKNOWN;
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorType = TaskError.AUTH;
          errorMessage = 'Authentication failed';
          break;
        case 400:
          errorType = TaskError.VALIDATION;
          errorMessage = error.response.data.message || 'Invalid request';
          break;
        case 500:
          errorType = TaskError.SERVER;
          errorMessage = 'Server error occurred';
          break;
        default:
          errorType = TaskError.SERVER;
          errorMessage = error.response.data.message || 'Server error occurred';
      }
    } else if (error.request) {
      errorType = TaskError.NETWORK;
      errorMessage = 'Network error occurred';
    }

    setError({ type: errorType, message: errorMessage });
    throw error;
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Filter management
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      signifier: '',
      tags: []
    });
  }, []);

  // Task fetching with debouncing and cache
  const fetchTasksForDateRange = useCallback(async (startDate, endDate, type) => {
    try {
      // For daily view, we want to be less aggressive with caching
      if (type !== 'daily' && loading !== LoadingState.IDLE) {
        console.log('Already loading, skipping fetch');
        return;
      }

      const fetchKey = `${type}-${startDate.toISOString()}-${endDate.toISOString()}`;

      // Only check cache for non-daily views
      if (type !== 'daily' && lastFetchRef.current === fetchKey) {
        console.log('Already fetched this range, skipping');
        return;
      }

      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      setLoading(LoadingState.FETCHING);
      console.log(`Fetching ${type} tasks for:`, startDate, endDate);

      try {
        const response = await axios.get(`${API_URL}/tasks/${type}`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          headers: getAuthHeaders()
        });

        console.log(`${type} tasks response:`, response.data);

        // For daily view, always update the state
        if (type === 'daily' || JSON.stringify(response.data) !== JSON.stringify(tasks)) {
          setTasks(response.data);
        }

        lastFetchRef.current = fetchKey;
      } catch (error) {
        console.error(`Error fetching ${type} tasks:`, error);
        handleApiError(error);
        setTasks(Array.isArray(tasks) ? [] : {}); // Reset tasks while preserving type
      } finally {
        setLoading(LoadingState.IDLE);
      }
    } catch (error) {
      handleApiError(error);
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError, loading, tasks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Task fetching
  const fetchTasks = useCallback(async (params = {}) => {
    try {
      setLoading(LoadingState.FETCHING);
      setError(null);
      const response = await axios.get(`${API_URL}/tasks`, {
        params: { ...filters, ...params },
        headers: getAuthHeaders()
      });
      setTasks(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [filters, getAuthHeaders, handleApiError]);

  const fetchAllTasks = useCallback(async () => {
    try {
      // Check if we're already loading
      if (loading !== LoadingState.IDLE) {
        console.log('Already loading all tasks, skipping fetch');
        return;
      }

      setLoading(LoadingState.FETCHING);
      setError(null);
      console.log('Fetching all tasks...');

      const response = await axios.get(`${API_URL}/tasks/all`, {
        headers: getAuthHeaders()
      });

      console.log('All tasks response:', response.data);

      // Always update the tasks state with the response
      setTasks(response.data || {});
      console.log('Updated tasks state');

    } catch (error) {
      console.error('Error fetching all tasks:', error);
      handleApiError(error);
      setTasks({}); // Reset tasks on error
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError, loading]);

  // Task operations
  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(LoadingState.CREATING);
      setError(null);
      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: getAuthHeaders()
      });

      setTasks(prev => {
        const newTask = response.data;
        const taskDate = new Date(newTask.dueDate || newTask.updatedAt || newTask.createdAt);
        const dateKey = format(taskDate, 'yyyy-MM-dd');

        const newTasks = { ...prev };
        if (!newTasks[dateKey]) {
          newTasks[dateKey] = [];
        }
        newTasks[dateKey].push(newTask);
        return newTasks;
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError]);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setLoading(LoadingState.UPDATING);
      setError(null);
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
        headers: getAuthHeaders()
      });

      setTasks(prev => {
        // If prev is an array (daily, weekly views)
        if (Array.isArray(prev)) {
          return prev.map(task =>
            task._id === taskId ? response.data : task
          );
        }

        // If prev is an object (all, monthly views)
        const newTasks = { ...prev };
        Object.entries(newTasks).forEach(([date, tasks]) => {
          if (Array.isArray(tasks)) {
            newTasks[date] = tasks.map(task =>
              task._id === taskId ? response.data : task
            );
          }
        });
        return newTasks;
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(LoadingState.DELETING);
      setError(null);
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: getAuthHeaders()
      });

      setTasks(prev => {
        const newTasks = {};
        Object.entries(prev).forEach(([date, tasks]) => {
          const filteredTasks = tasks ? tasks.filter(task => task._id !== taskId) : [];
          if (filteredTasks.length > 0) {
            newTasks[date] = filteredTasks;
          }
        });
        return newTasks;
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError]);

  // Migration operations
  const migrateTask = useCallback(async (taskId, targetDate) => {
    try {
      setLoading(LoadingState.MIGRATING);
      setError(null);
      const response = await axios.post(
        `${API_URL}/tasks/${taskId}/migrate`,
        { targetDate: targetDate.toISOString() },
        { headers: getAuthHeaders() }
      );

      setTasks(prev => {
        const newTasks = {};
        Object.entries(prev).forEach(([date, tasks]) => {
          const filteredTasks = tasks.filter(task => task._id !== taskId);
          if (filteredTasks.length > 0) {
            newTasks[date] = filteredTasks;
          }
        });

        const newDate = format(new Date(targetDate), 'yyyy-MM-dd');
        if (!newTasks[newDate]) {
          newTasks[newDate] = [];
        }
        newTasks[newDate].push(response.data);

        return newTasks;
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(LoadingState.IDLE);
    }
  }, [getAuthHeaders, handleApiError]);

  // Convenience methods for different views
  const fetchDailyTasks = useCallback((date) => {
    return fetchTasksForDateRange(date, date, 'daily');
  }, [fetchTasksForDateRange]);

  const fetchWeeklyTasks = useCallback((weekStart, weekEnd) => {
    return fetchTasksForDateRange(weekStart, weekEnd, 'weekly');
  }, [fetchTasksForDateRange]);

  const fetchMonthlyTasks = useCallback((monthStart, monthEnd) => {
    return fetchTasksForDateRange(monthStart, monthEnd, 'monthly');
  }, [fetchTasksForDateRange]);

  const fetchYearlyTasks = useCallback((yearStart, yearEnd) => {
    return fetchTasksForDateRange(yearStart, yearEnd, 'yearly');
  }, [fetchTasksForDateRange]);

  const value = {
    // State
    tasks,
    loading,
    error,
    filters,

    // Filter management
    updateFilters,
    clearFilters,

    // Task operations
    fetchTasks,
    fetchAllTasks,
    createTask,
    updateTask,
    deleteTask,
    migrateTask,

    // View-specific fetches
    fetchDailyTasks,
    fetchWeeklyTasks,
    fetchMonthlyTasks,
    fetchYearlyTasks,

    // Constants
    TaskError,
    LoadingState
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskProvider };