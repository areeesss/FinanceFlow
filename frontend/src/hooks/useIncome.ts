import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeService } from '@/services/incomeApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Define types for income data
interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date?: string;
  color: string;
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  description?: string;
}

// Color palette for income sources
const INCOME_COLORS = [
  "#0000FF", // Dark blue (from image)
  "#191970", // Navy blue (from image)
  "#483D8B", // Medium blue (from image)
  "#0000CD", // Lighter blue (from image)
  "#4299E1", // Additional blues
  "#3182CE", 
  "#667EEA",
  "#5A67D8",
  "#38B2AC",
  "#4FD1C5",
  "#38A169", 
  "#48BB78",
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

export function useIncome() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [incomeData, setIncomeData] = useState<IncomeItem[]>([]);
  
  // Get income data with React Query
  const { 
    data: income = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      try {
        console.log("Fetching income data...");
        const response = await incomeService.getAll();
        console.log("Income data fetched:", response);
        return processApiResponse<any>(response);
      } catch (error) {
        console.error("Error fetching income:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Define mutations for CRUD operations
  const createIncomeMutation = useMutation({
    mutationFn: (data: any) => incomeService.create(data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Income added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
    onError: (error) => {
      console.error("Error adding income:", error);
      addToast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive",
      });
    }
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      incomeService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Income updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
    onError: (error) => {
      console.error("Error updating income:", error);
      addToast({
        title: "Error",
        description: "Failed to update income",
        variant: "destructive",
      });
    }
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => incomeService.delete(id),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Income deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
    onError: (error) => {
      console.error("Failed to delete income:", error);
      addToast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive",
      });
    }
  });

  // Process income data from the backend with saved colors
  useEffect(() => {
    if (income && Array.isArray(income)) {
      console.log("Income data from backend:", income);
      if (income.length > 0) {
        console.log("First income item:", income[0]);
      }
      
      // Load saved colors from localStorage
      let savedColors: Record<string, string> = {};
      try {
        savedColors = JSON.parse(localStorage.getItem('incomeColors') || '{}');
        console.log("Loaded colors from localStorage:", savedColors);
      } catch (e) {
        console.error("Failed to parse saved colors:", e);
      }
      
      setIncomeData(income.map((item, index) => {
        // Ensure we have an ID - use id, or fallback to index
        const itemId = item.id || `temp-${index}`;
        
        // Determine color: use saved color, color from backend, or fallback to default color
        const color = savedColors[itemId] || item.color || INCOME_COLORS[index % INCOME_COLORS.length];
        
        // Save color for this ID to maintain consistency
        if (!savedColors[itemId]) {
          savedColors[itemId] = color;
        }
        
        return {
          id: itemId,
          source: item.source || item.name || 'Unnamed',
          amount: Number(item.amount) || 0,
          date: item.date,
          color,
          recurring: item.recurring || false,
          frequency: item.frequency || 'monthly'
        };
      }));
      
      // Save updated colors to localStorage
      try {
        localStorage.setItem('incomeColors', JSON.stringify(savedColors));
      } catch (e) {
        console.error("Failed to save colors to localStorage:", e);
      }
    }
  }, [income]);

  // Get total income amount
  const totalIncome = useMemo(() => {
    return incomeData.reduce((sum, item) => sum + item.amount, 0);
  }, [incomeData]);

  // Function to create a new income entry
  const createIncome = async (incomeData: {
    source: string;
    amount: string | number;
    recurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    color?: string;
  }) => {
    if (!incomeData.source || !incomeData.amount) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = typeof incomeData.amount === 'string' 
      ? parseFloat(incomeData.amount)
      : incomeData.amount;
      
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const formattedData = {
      source: incomeData.source,
      amount,
      name: incomeData.source, // Set name equal to source for consistency
      date: new Date().toISOString().split('T')[0],
      description: `Income from ${incomeData.source}`,
      color: incomeData.color || INCOME_COLORS[Math.floor(Math.random() * INCOME_COLORS.length)],
      recurring: incomeData.recurring || false,
      frequency: incomeData.frequency || 'monthly'
    };

    return createIncomeMutation.mutateAsync(formattedData);
  };

  // Function to update an income entry
  const updateIncome = async (id: string, incomeData: Partial<IncomeItem>) => {
    if (!id) {
      addToast({
        title: "Error",
        description: "Missing income ID",
        variant: "destructive",
      });
      return;
    }

    const income = incomeData.amount !== undefined && typeof incomeData.amount === 'string' 
      ? { ...incomeData, amount: parseFloat(incomeData.amount) }
      : incomeData;
      
    const formattedData = {
      ...income,
      name: income.source // No need to use income.name as it's not in the interface
    };

    return updateIncomeMutation.mutateAsync({ id, data: formattedData });
  };

  // Function to delete an income entry
  const deleteIncome = async (id: string) => {
    if (!id) {
      addToast({
        title: "Error",
        description: "Missing income ID",
        variant: "destructive",
      });
      return;
    }

    return deleteIncomeMutation.mutateAsync(id);
  };

  // Function to get chart data formatted for visualizations
  const getChartData = () => {
    return incomeData.map(item => ({
      name: item.source,
      value: item.amount,
      fill: item.color
    }));
  };

  // Get income by time period (week, month, year)
  const getIncomeByPeriod = (period: 'week' | 'month' | 'year') => {
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
    
    // Filter income by date
    return incomeData.filter(income => {
      if (!income.date) return false;
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= now;
    });
  };

  // Function to get income trends (monthly)
  const getMonthlyTrends = () => {
    const monthlyData: Record<string, number> = {};
    
    // Group income by month
    incomeData.forEach(income => {
      if (!income.date) return;
      
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      monthlyData[monthKey] += income.amount;
    });
    
    // Convert to array and sort by month
    return Object.entries(monthlyData)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Function to get income grouped by source
  const getIncomeBySource = () => {
    const sourceData: Record<string, number> = {};
    
    // Group income by source
    incomeData.forEach(income => {
      const source = income.source;
      
      if (!sourceData[source]) {
        sourceData[source] = 0;
      }
      
      sourceData[source] += income.amount;
    });
    
    // Convert to array
    return Object.entries(sourceData)
      .map(([source, total]) => ({ 
        source, 
        total,
        color: incomeData.find(i => i.source === source)?.color || INCOME_COLORS[0]
      }))
      .sort((a, b) => b.total - a.total); // Sort by total, highest first
  };

  // Function to calculate projected income based on recurring entries
  const getProjectedIncome = (months = 12) => {
    let projected = 0;
    
    // Calculate projected income for recurring entries
    incomeData.forEach(income => {
      if (income.recurring) {
        let multiplier = 0;
        
        // Calculate based on frequency
        switch (income.frequency) {
          case 'daily':
            multiplier = 30 * months; // Approximate days per month
            break;
          case 'weekly':
            multiplier = 4 * months; // Approximate weeks per month
            break;
          case 'biweekly':
            multiplier = 2 * months; // Approximate biweekly occurrences per month
            break;
          case 'monthly':
            multiplier = months;
            break;
          case 'quarterly':
            multiplier = months / 3;
            break;
          case 'annually':
            multiplier = months / 12;
            break;
          default:
            multiplier = months;
        }
        
        projected += income.amount * multiplier;
      }
    });
    
    return projected;
  };

  // Function to get recurring income items
  const getRecurringIncome = () => {
    return incomeData.filter(income => income.recurring);
  };

  return {
    income: incomeData,
    isLoading,
    error,
    refetch,
    totalIncome,
    formatCurrency,
    createIncome,
    updateIncome,
    deleteIncome,
    getChartData,
    getIncomeByPeriod,
    getMonthlyTrends,
    getIncomeBySource,
    getProjectedIncome,
    getRecurringIncome,
    mutations: {
      create: createIncomeMutation,
      update: updateIncomeMutation,
      delete: deleteIncomeMutation
    }
  };
} 