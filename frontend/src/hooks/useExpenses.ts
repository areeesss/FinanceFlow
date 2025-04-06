import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Define types for expense data
interface ExpenseItem {
  id: string;
  type: string;
  amount: number;
  date?: string;
  fill?: string;
  color: string;
  name?: string;
  description?: string;
}

// Color palette for expenses
const EXPENSE_COLORS = [
  "#FF0000", // Red (from image)
  "#DC143C", // Crimson red (from image)
  "#B22222", // Fire brick red (from image)
  "#8B0000", // Dark red (from image)
  "#F56565", // Additional reds
  "#E53E3E",
  "#C53030",
  "#9B2C2C",
  "#742A2A",
  "#ED8936", // Orange
  "#DD6B20", // Dark Orange
  "#9F7AEA", // Purple
];

// Process API response to handle different formats
const processApiResponse = <T extends unknown>(response: any): T[] => {
  if (!response || response.data === undefined) return [];

  // Handle different response formats
  if (Array.isArray(response.data)) {
    return response.data as T[];
  } 
  
  if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results as T[];
  } 
  
  if (typeof response.data === 'object' && response.data !== null) {
    // Handle single item
    if (response.data.id || response.data._id) {
      return [response.data] as T[];
    }
    
    // Handle nested data
    const dataKeys = ['income', 'expenses', 'goals', 'budgets'];
    for (const key of dataKeys) {
      if (response.data[key] && Array.isArray(response.data[key])) {
        return response.data[key] as T[];
      }
    }
    
    // Handle object of objects case
    const potentialItems = Object.values(response.data).filter(
      item => typeof item === 'object' && item !== null
    );
    
    if (potentialItems.length > 0) {
      return potentialItems as T[];
    }
  }
  
  // Return empty array as fallback
  return [];
};

// Format currency function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

export function useExpenses() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>([]);
  
  // Get expenses data with React Query
  const { 
    data: expenses = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        console.log("Fetching expenses data...");
        const response = await expenseService.getAll();
        console.log("Expenses data fetched:", response);
        return processApiResponse<any>(response);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Define mutations for CRUD operations
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => expenseService.create(data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Expense added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      addToast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      expenseService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Expense updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      addToast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      console.error("Failed to delete expense:", error);
      addToast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  });

  // Process expense data from the backend with saved colors
  useEffect(() => {
    if (expenses && Array.isArray(expenses)) {
      console.log("Expense data from backend:", expenses);
      if (expenses.length > 0) {
        console.log("First expense item:", expenses[0]);
      }
      
      // Load saved colors from localStorage
      let savedColors: Record<string, string> = {};
      try {
        savedColors = JSON.parse(localStorage.getItem('expenseColors') || '{}');
        console.log("Loaded colors from localStorage:", savedColors);
      } catch (e) {
        console.error("Failed to parse saved colors:", e);
      }
      
      setExpenseData(expenses.map((item, index) => {
        // Ensure we have an ID - use id, or fallback to index
        const itemId = item.id || `temp-${index}`;
        
        // Determine color: use saved color, color from backend, or fallback to default color
        const color = savedColors[itemId] || item.color || EXPENSE_COLORS[index % EXPENSE_COLORS.length];
        
        // Save color for this ID to maintain consistency
        if (!savedColors[itemId]) {
          savedColors[itemId] = color;
        }
        
        return {
          id: itemId,
          type: item.type || item.name || 'Unnamed',
          amount: Number(item.amount) || 0,
          date: item.date,
          color,
          fill: color
        };
      }));
      
      // Save updated colors to localStorage
      try {
        localStorage.setItem('expenseColors', JSON.stringify(savedColors));
      } catch (e) {
        console.error("Failed to save colors to localStorage:", e);
      }
    }
  }, [expenses]);

  // Get total expenses amount
  const totalExpenses = useMemo(() => {
    return expenseData.reduce((sum, item) => sum + item.amount, 0);
  }, [expenseData]);

  // Function to create a new expense
  const createExpense = async (expenseData: {
    type: string;
    amount: string | number;
    color?: string;
  }) => {
    if (!expenseData.type || !expenseData.amount) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = typeof expenseData.amount === 'string' 
      ? parseFloat(expenseData.amount)
      : expenseData.amount;
      
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const formattedData = {
      type: expenseData.type,
      amount,
      name: expenseData.type, // Set name equal to type for consistency
      date: new Date().toISOString().split('T')[0],
      description: `Expense for ${expenseData.type}`,
      color: expenseData.color || EXPENSE_COLORS[Math.floor(Math.random() * EXPENSE_COLORS.length)]
    };

    return createExpenseMutation.mutateAsync(formattedData);
  };

  // Function to update an expense
  const updateExpense = async (id: string, expenseData: Partial<ExpenseItem>) => {
    if (!id) {
      addToast({
        title: "Error",
        description: "Missing expense ID",
        variant: "destructive",
      });
      return;
    }

    const expense = expenseData.amount !== undefined && typeof expenseData.amount === 'string' 
      ? { ...expenseData, amount: parseFloat(expenseData.amount) }
      : expenseData;
      
    const formattedData = {
      ...expense,
      name: expense.type || expense.name,
    };

    return updateExpenseMutation.mutateAsync({ id, data: formattedData });
  };

  // Function to delete an expense
  const deleteExpense = async (id: string) => {
    if (!id) {
      addToast({
        title: "Error",
        description: "Missing expense ID",
        variant: "destructive",
      });
      return;
    }

    return deleteExpenseMutation.mutateAsync(id);
  };

  // Function to get chart data formatted for visualizations
  const getChartData = () => {
    return expenseData.map(item => ({
      name: item.type,
      value: item.amount,
      fill: item.color
    }));
  };

  // Get expenses by time period (week, month, year)
  const getExpensesByPeriod = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate = new Date();
    
    // Set start date based on period
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Filter expenses by date
    return expenseData.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  };

  // Function to get spending trends (monthly)
  const getMonthlyTrends = () => {
    const monthlyData: Record<string, number> = {};
    
    // Group expenses by month
    expenseData.forEach(expense => {
      if (!expense.date) return;
      
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      monthlyData[monthKey] += expense.amount;
    });
    
    // Convert to array and sort by month
    return Object.entries(monthlyData)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Function to get expenses grouped by category
  const getExpensesByCategory = () => {
    const categoryData: Record<string, number> = {};
    
    // Group expenses by type/category
    expenseData.forEach(expense => {
      const category = expense.type;
      
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      
      categoryData[category] += expense.amount;
    });
    
    // Convert to array
    return Object.entries(categoryData)
      .map(([category, total]) => ({ 
        category, 
        total,
        color: expenseData.find(e => e.type === category)?.color || EXPENSE_COLORS[0]
      }))
      .sort((a, b) => b.total - a.total); // Sort by total, highest first
  };

  return {
    expenses: expenseData,
    isLoading,
    error,
    refetch,
    totalExpenses,
    formatCurrency,
    createExpense,
    updateExpense,
    deleteExpense,
    getChartData,
    getExpensesByPeriod,
    getMonthlyTrends,
    getExpensesByCategory,
    mutations: {
      create: createExpenseMutation,
      update: updateExpenseMutation,
      delete: deleteExpenseMutation
    }
  };
} 