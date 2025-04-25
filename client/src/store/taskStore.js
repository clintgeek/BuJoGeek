import { create } from 'zustand';
import axios from 'axios';
import { format } from 'date-fns';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  currentView: 'all',
  currentDate: new Date(),
  filters: {
    search: '',
    status: '',
    priority: ''
  },

  // Set the current view and date
  setView: (view, date = new Date()) => {
    console.log('Setting view:', view, 'date:', date);
    set({ currentView: view, currentDate: date });
    get().fetchTasks();
  },

  // Set filters
  setFilters: (newFilters) => {
    console.log('Setting filters:', newFilters);
    set({ filters: newFilters });
    get().fetchTasks();
  },

  // Fetch tasks for the current view
  fetchTasks: async () => {
    const { currentView, currentDate, filters } = get();
    console.log('Fetching tasks for view:', currentView, 'date:', currentDate, 'filters:', filters);
    set({ loading: true, error: null });

    try {
      let endpoint = '/tasks';
      if (currentView !== 'all') {
        endpoint = `/tasks/${currentView}`;
      }

      console.log('Making request to:', endpoint);
      const response = await api.get(endpoint, {
        params: {
          date: format(currentDate, 'yyyy-MM-dd'),
          ...filters
        }
      });

      console.log('Received response:', response.data);
      // Ensure we have an array of tasks
      const tasks = Array.isArray(response.data) ? response.data : [];
      console.log('Processed tasks:', tasks);
      set({ tasks, loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: error.message, loading: false, tasks: [] });
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/tasks', taskData);
      set(state => ({
        tasks: [...state.tasks, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${taskId}`, updateData);
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/tasks/${taskId}`);
      set(state => ({
        tasks: state.tasks.filter(task => task._id !== taskId),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add a subtask
  addSubtask: async (parentId, subtaskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${parentId}/subtasks`, subtaskData);
      set(state => ({
        tasks: [...state.tasks, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error adding subtask:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Migrate task to backlog
  migrateToBacklog: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${taskId}/migrate-back`);
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error migrating task to backlog:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Migrate task to future date
  migrateToFuture: async (taskId, futureDate) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${taskId}/migrate-future`, { futureDate });
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error migrating task to future:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useTaskStore;