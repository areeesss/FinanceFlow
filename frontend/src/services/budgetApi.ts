import apiClient from '@/api/apiClient';

export const budgetService = {
  getAll: () => apiClient.get('/budgets/'),
  
  create: async (data: any) => {
    const formattedData = {
      name: data.name,
      period: data.period,
      start_date: data.startDate,
      end_date: data.endDate,
      target_amount: data.totalPlanned,
      current_amount: data.totalActual,
      items: [],
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

  update: async (id: number, data: any) => {
    // Assume the data object passed from the hook is already correctly formatted
    // with backend expected field names (target_amount, current_amount, start_date, end_date, items)
    const updatePayload = data;

    // Filter out undefined values before sending (optional but good practice)
    const filteredPayload: any = Object.fromEntries(
      Object.entries(updatePayload).filter(([_, value]) => value !== undefined)
    );

    try {
      // Send the prepared and filtered payload directly
      const response = await apiClient.put(`/budgets/${id.toString()}/`, filteredPayload);
      return response.data;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
        // Re-throw the error to be caught by the calling mutation/query
        throw new Error(error.response.data.detail || error.message);
      } else {
        // Re-throw generic error
        throw new Error(error.message);
      }
    }
  },

  delete: async (id: number) => {
    await apiClient.delete(`/budgets/${id.toString()}/`);
  }
}; 