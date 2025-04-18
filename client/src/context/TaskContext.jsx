import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TaskContext = createContext();

const initialFilters = {
  status: '',
  priority: '',
  signifier: '',
  tags: [],
  search: '',
  dueDate: null
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  // Get the auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.signifier) params.signifier = filters.signifier;
      if (filters.tags?.length) params.tags = filters.tags.join(',');
      if (filters.search) params.search = filters.search;
      if (filters.dueDate) params.dueDate = filters.dueDate;

      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }, [filters]);

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks(prevTasks => [...prevTasks, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? response.data : task
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? response.data : task
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prevTasks =>
        prevTasks.filter(task => task._id !== taskId)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const addSubtask = async (parentId, subtaskData) => {
    try {
      const response = await api.post(`/tasks/${parentId}/subtasks`, subtaskData);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === parentId
            ? { ...task, subtasks: [...(task.subtasks || []), response.data] }
            : task
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const value = {
    tasks,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addSubtask,
    updateFilters,
    clearFilters
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};