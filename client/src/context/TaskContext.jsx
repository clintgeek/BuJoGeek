import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    signifier: '',
    tags: []
  });

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

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDailyTasks = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/daily`, {
        params: { date: date.toISOString() },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching daily tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeeklyTasks = useCallback(async (weekStart, weekEnd) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/weekly`, {
        params: {
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString()
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weekly tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyTasks = useCallback(async (monthStart, monthEnd) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/monthly`, {
        params: {
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString()
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching monthly tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYearlyTasks = useCallback(async (yearStart, yearEnd) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/yearly`, {
        params: {
          startDate: yearStart.toISOString(),
          endDate: yearEnd.toISOString()
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching yearly tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get(`${API_URL}/tasks/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching all tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTasks(prev => {
        // Handle both array and object structures
        if (Array.isArray(prev)) {
          return [...prev, response.data];
        } else if (typeof prev === 'object' && prev !== null) {
          // Handle grouped tasks by date
          const newTask = response.data;
          const taskDate = new Date(newTask.dueDate || newTask.updatedAt || newTask.createdAt);
          const dateKey = format(taskDate, 'yyyy-MM-dd');

          const newTasks = { ...prev };
          if (!newTasks[dateKey]) {
            newTasks[dateKey] = [];
          }
          newTasks[dateKey].push(newTask);
          return newTasks;
        }
        return [response.data];
      });
    } catch (err) {
      setError(err.message);
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTasks(prev => {
        // Handle both array and object structures
        if (Array.isArray(prev)) {
          return prev.map(task => task._id === taskId ? response.data : task);
        } else if (typeof prev === 'object' && prev !== null) {
          // Handle grouped tasks by date
          const newTasks = {};
          Object.entries(prev).forEach(([date, tasks]) => {
            const updatedTasks = tasks.map(task => task._id === taskId ? response.data : task);
            if (updatedTasks.length > 0) {
              newTasks[date] = updatedTasks;
            }
          });
          return newTasks;
        }
        return prev;
      });
    } catch (err) {
      setError(err.message);
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(prev => {
        // Handle both array and object structures
        if (Array.isArray(prev)) {
          return prev.filter(task => task._id !== taskId);
        } else if (typeof prev === 'object' && prev !== null) {
          // Handle grouped tasks by date
          const newTasks = {};
          Object.entries(prev).forEach(([date, tasks]) => {
            const filteredTasks = tasks.filter(task => task._id !== taskId);
            if (filteredTasks.length > 0) {
              newTasks[date] = filteredTasks;
            }
          });
          return newTasks;
        }
        return prev;
      });
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    tasks,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    fetchTasks,
    fetchDailyTasks,
    fetchWeeklyTasks,
    fetchMonthlyTasks,
    fetchYearlyTasks,
    fetchAllTasks,
    createTask,
    updateTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskProvider };