import apiClient from '@/api/apiClient';

export const budgetService = {
  getAll: () => apiClient.get('/budgets/'),
  
  create: async (data: any) => {
    const formattedData = {
      name: data.name,
      target_amount: data.totalPlanned || data.target_amount || 0,
      current_amount: data.totalActual || data.current_amount || 0,
      start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.endDate || data.end_date || new Date().toISOString().split('T')[0],
      description: data.description || `Budget for ${data.name}`,
      period: data.period || 'monthly',
      items: data.items || []
    };
    
    try {
      const response = await apiClient.post('/budgets/', formattedData);
      return response;
    } catch (error: any) {
      console.error('Error creating budget:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    const formattedData = {
      name: data.name,
      target_amount: data.totalPlanned || data.target_amount || 0,
      current_amount: data.totalActual || data.current_amount || 0,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      description: data.description || `Budget for ${data.name}`,
      period: data.period || 'monthly',
      items: data.items || [],
      id: id
    };
    
    try {
      const response = await apiClient.put(`/budgets/${id}/`, formattedData);
      return response;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/budgets/${id}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }
}; 