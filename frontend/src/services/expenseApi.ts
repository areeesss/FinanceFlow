import apiClient from '@/api/apiClient';

// Default color utilities for expenses
const defaultExpenseColors = [
  '#EF4444', // Red
  '#F59E0B', // Amber/Orange
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#84CC16'  // Lime
];

// Get a default expense color based on existing items
const getDefaultExpenseColor = (): string => {
  try {
    const existingColors = JSON.parse(localStorage.getItem('expenseColors') || '{}');
    const colorCount = Object.keys(existingColors).length;
    return defaultExpenseColors[colorCount % defaultExpenseColors.length];
  } catch (error) {
    console.error('Error getting default expense color:', error);
    return '#EF4444'; // Default to red 500 if there's an error
  }
};

export const expenseService = {
  getAll: () => apiClient.get('/expenses/'),
  
  create: async (data: any) => {
    const formattedData = {
      type: data.type || 'Unnamed Expense',
      amount: data.amount || 0,
      description: data.description || `Expense for ${data.type || 'unknown purpose'}`,
      date: data.date || new Date().toISOString().split('T')[0],
      name: data.name || data.type || 'Unnamed Expense',
      color: data.color || getDefaultExpenseColor()
    };
    
    try {
      const response = await apiClient.post('/expenses/', formattedData);
      return response;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  update: async (id: string | number, data: any) => {
    const stringId = String(id);
    const formattedData = {
      type: data.type || 'Unnamed Expense',
      amount: data.amount || 0,
      description: data.description || `Expense for ${data.type || 'unknown purpose'}`,
      name: data.name || data.type || 'Unnamed Expense',
      color: data.color || getDefaultExpenseColor(),
      ...(data.date && { date: data.date }),
      id: stringId
    };
    
    try {
      const response = await apiClient.put(`/expenses/${stringId}/`, formattedData);
      return response;
    } catch (error: any) {
      console.error('Error updating expense:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  delete: async (id: string | number) => {
    const stringId = String(id);
    try {
      const response = await apiClient.delete(`/expenses/${stringId}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }
}; 