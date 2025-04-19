import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

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
      setTasks(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating task:', err);
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
      setTasks(prev => prev.filter(task => task._id !== taskId));
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
    createTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskProvider };