import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budgetApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Define TypeScript interfaces
interface BudgetItem {
  id: number;
  category: string; 
  planned: number;
  actual: number;
  remaining: number;
  progress: number;
}

interface Budget {
  id: number;
  name: string;
  period: "daily" | "weekly" | "monthly";
  items: BudgetItem[];
  totalPlanned: number;
  totalActual: number;
  startDate?: string;
  endDate?: string;
}

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

// Map backend budget format to frontend format
const mapBackendToFrontend = (backendBudget: any): Budget => {
  // Default period based on date range or use the one from backend
  let period: "daily" | "weekly" | "monthly" = backendBudget.period || "monthly";
  
  // Determine period based on date range if not specified in backend
  if (!backendBudget.period && backendBudget.start_date && backendBudget.end_date) {
    const startDate = new Date(backendBudget.start_date);
    const endDate = new Date(backendBudget.end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      period = "daily";
    } else if (daysDiff <= 7) {
      period = "weekly";
    } else {
      period = "monthly";
    }
  }
  
  // Use items from backend if available
  let items: BudgetItem[] = [];
  if (backendBudget.items && Array.isArray(backendBudget.items)) {
    items = backendBudget.items.map((item: any) => ({
      id: item.id,
      category: item.category,
      planned: Number(item.planned) || 0,
      actual: Number(item.actual) || 0,
      remaining: Number(item.remaining) || 0,
      progress: Number(item.progress) || 0,
    }));
  }
  
  return {
    id: backendBudget.id,
    name: backendBudget.name,
    period,
    items,
    totalPlanned: Number(backendBudget.target_amount) || 0,
    totalActual: Number(backendBudget.current_amount) || 0,
    startDate: backendBudget.start_date,
    endDate: backendBudget.end_date,
  };
};

export function useBudgets(initialPeriod: "daily" | "weekly" | "monthly" = "daily") {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [localBudgets, setLocalBudgets] = useState<Budget[]>([]);
  const [activePeriod, setActivePeriod] = useState<"daily" | "weekly" | "monthly">(initialPeriod);
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);

  // Fetch budgets data
  const { 
    data: budgetsData = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        console.log("Fetching budgets data...");
        const response = await budgetService.getAll();
        console.log("Budgets data fetched:", response);
        return processApiResponse<any>(response);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Effect to map backend data and update localBudgets
  useEffect(() => {
    if (budgetsData && Array.isArray(budgetsData)) {
      console.log("Raw budgets data from backend:", budgetsData);
      const mappedBudgets = budgetsData.map(mapBackendToFrontend);
      setLocalBudgets(mappedBudgets);
    }
  }, [budgetsData]); // Depend only on budgetsData changing

  // Filter budgets by period type
  const filteredBudgets = useMemo(() => {
    return localBudgets.filter(budget => budget.period === activePeriod);
  }, [localBudgets, activePeriod]); // Depend on localBudgets and activePeriod

  // Effect to update currentBudgetId when localBudgets or activePeriod changes
  // This logic determines which budget should be selected based on the current state.
  useEffect(() => {
    let nextBudgetId: number | null = null;

    // Find the first budget in the filtered list for the current active period
    const firstBudgetInActivePeriod = filteredBudgets.length > 0 ? filteredBudgets[0].id : null;

    // Determine the next currentBudgetId:
    // 1. If the current currentBudgetId exists in the filtered list, keep it.
    // 2. Otherwise, if there's a first budget in the active period, select that.
    // 3. Otherwise (filtered list is empty), set to null.

    const currentBudgetExistsInFiltered = currentBudgetId !== null && filteredBudgets.some(budget => budget.id === currentBudgetId);

    if (currentBudgetExistsInFiltered) {
      nextBudgetId = currentBudgetId;
    } else if (firstBudgetInActivePeriod !== null) {
      nextBudgetId = firstBudgetInActivePeriod;
    } else {
      nextBudgetId = null;
    }

    // Only update state if the calculated nextBudgetId is different from the current one.
    // This check is crucial to prevent infinite loops.
    if (nextBudgetId !== currentBudgetId) {
      setCurrentBudgetId(nextBudgetId);
    }

  }, [localBudgets, activePeriod]); // Dependencies: localBudgets and activePeriod
  // Note: We intentionally exclude currentBudgetId from dependencies to prevent infinite loops.

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => budgetService.create(data),
    onSuccess: (response) => {
      addToast({
        title: "Success",
        description: "Budget created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      // Set new budget as current if we have a response with ID
      if (response && response.data && response.data.id) {
        setCurrentBudgetId(response.data.id);
      }
    },
    onError: (error) => {
      console.error("Error creating budget:", error);
      addToast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      budgetService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Budget updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      console.error("Error updating budget:", error);
      addToast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    }
  });

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => budgetService.delete(id),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (error) => {
      console.error("Failed to delete budget:", error);
      addToast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  });

  // Function to create a new budget
  const createBudget = async (budgetData: {
    name: string;
    period: "daily" | "weekly" | "monthly";
    startDate: string;
    endDate: string;
  }) => {
    if (!budgetData.name || !budgetData.period || !budgetData.startDate || !budgetData.endDate) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newBudgetData = {
      name: budgetData.name,
      totalPlanned: 0, // Start with 0, will be updated when items are added
      totalActual: 0,
      startDate: budgetData.startDate,
      endDate: budgetData.endDate,
      period: budgetData.period
    };
    
    return createBudgetMutation.mutateAsync(newBudgetData);
  };

  // Function to add a new budget item
  const addBudgetItem = async (budgetId: number, itemData: {
    category: string;
    planned: number;
  }) => {
    if (!itemData.category || !itemData.planned || !budgetId) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const budget = localBudgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    const newItem = {
      id: budget.items.length > 0
        ? Math.max(...budget.items.map((item) => item.id)) + 1
        : 1,
      category: itemData.category,
      planned: itemData.planned,
      actual: 0,
      remaining: itemData.planned,
      progress: 0,
    };
    
    const updatedItems = [...budget.items, newItem];

    // Recalculate totalPlanned and totalActual based on updated items
    const totalPlanned = updatedItems.reduce(
      (sum, item) => sum + item.planned,
      0
    );
    const totalActual = updatedItems.reduce(
      (sum, item) => sum + item.actual,
      0
    );

    // Construct the update payload similar to deleteBudgetItem
    const dataForUpdate = {
      ...budget, // Spread existing budget data
      items: updatedItems, // Include the updated items array
      target_amount: totalPlanned, // Include totalPlanned (backend's target_amount)
      current_amount: totalActual, // Include totalActual (backend's current_amount)
      // Ensure backend field names are used for dates if they were part of the spread and needed
      start_date: budget.startDate, // Explicitly include with backend name
      end_date: budget.endDate,   // Explicitly include with backend name
      id: budget.id, // Ensure ID is included
      name: budget.name, // Ensure name is included
      period: budget.period, // Ensure period is included
    };

    console.log("Data being sent to updateBudgetMutation:", dataForUpdate);

    return updateBudgetMutation.mutateAsync({
      id: budgetId,
      data: dataForUpdate, // Send the constructed data
    });
  };

  // Function to delete a budget item
  const deleteBudgetItem = async (budgetId: number, itemId: number) => {
    if (!itemId || !budgetId) return;
    
    const budget = localBudgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    const updatedItems = budget.items.filter(
      (item) => item.id !== itemId
    );
    
    const totalPlanned = updatedItems.reduce(
      (sum, item) => sum + item.planned,
      0
    );
    
    const totalActual = updatedItems.reduce(
      (sum, item) => sum + item.actual,
      0
    );
    
    const updatedBudget = { 
      ...budget,
      items: updatedItems,
      totalPlanned,
      totalActual
    };
    
    return updateBudgetMutation.mutateAsync({ 
      id: budgetId, 
      data: updatedBudget 
    });
  };

  // Function to delete a budget
  const deleteBudget = async (budgetId: number) => {
    if (!budgetId) return;
    
    try {
      // Clean up localStorage data before deletion
      localStorage.removeItem(`budget_items_${budgetId}`);
      
      // Remove period from localStorage
      const periodMap = JSON.parse(localStorage.getItem('budget_periods') || '{}');
      if (periodMap[budgetId]) {
        delete periodMap[budgetId];
        localStorage.setItem('budget_periods', JSON.stringify(periodMap));
      }
      
      // If we're deleting the current budget, we need to select another one
      if (currentBudgetId === budgetId) {
        // Find another budget in the same period
        const otherBudgetInPeriod = localBudgets.find(
          budget => budget.id !== budgetId && budget.period === activePeriod
        );
        
        // Or just any other budget
        const anyOtherBudget = localBudgets.find(
          budget => budget.id !== budgetId
        );
        
        if (otherBudgetInPeriod) {
          setCurrentBudgetId(otherBudgetInPeriod.id);
        } else if (anyOtherBudget) {
          setCurrentBudgetId(anyOtherBudget.id);
        } else {
          setCurrentBudgetId(null);
        }
      }
      
      // Perform the delete operation
      return deleteBudgetMutation.mutateAsync(budgetId);
      
    } catch (error) {
      console.error("Error preparing budget deletion:", error);
      addToast({
        title: "Error",
        description: "Failed to prepare budget for deletion",
        variant: "destructive",
      });
    }
  };

  // Function to update budget category spending
  const updateCategorySpending = async (
    budgetId: number,
    itemId: number,
    amount: string | number
  ) => {
    const budget = localBudgets.find(b => b.id === budgetId);
    if (!budget) return;
    
    const actualAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(actualAmount)) return;
    
    const updatedItems = budget.items.map((item) => {
      if (item.id === itemId) {
        const actual = actualAmount;
        const remaining = item.planned - actual;
        const progress = item.planned > 0
          ? Math.min(100, (actual / item.planned) * 100)
          : 0;
        
        return {
          ...item,
          actual,
          remaining,
          progress,
        };
      }
      return item;
    });

    // Recalculate totalActual and include totalPlanned to send to backend (required)
    const totalActual = updatedItems.reduce(
      (sum, item) => sum + item.actual,
      0
    );
    const totalPlanned = budget.totalPlanned; // Get existing totalPlanned

    const dataForUpdate = {
      id: budget.id, // Include ID for the backend endpoint
      name: budget.name, // Include name
      period: budget.period, // Include period
      start_date: budget.startDate, // Include dates, using backend field name
      end_date: budget.endDate,   // Include dates, using backend field name
      items: updatedItems, // Send the updated items array
      target_amount: totalPlanned, // Include totalPlanned (backend's target_amount)
      current_amount: totalActual, // Include totalActual (backend's current_amount)
    };

    return updateBudgetMutation.mutateAsync({
      id: budgetId,
      data: dataForUpdate, // Send the cleaned data
    });
  };

  // Calculate overall budget status
  const getBudgetStatus = (budget: Budget | undefined) => {
    if (!budget) return { status: "N/A", color: "gray" };
    const percentSpent =
      budget.totalPlanned > 0
        ? (budget.totalActual / budget.totalPlanned) * 100
        : 0;
    if (percentSpent > 90) {
      return { status: "Critical", color: "red" };
    } else if (percentSpent > 75) {
      return { status: "Warning", color: "orange" };
    } else {
      return { status: "Good", color: "green" };
    }
  };

  // Get current budget
  const currentBudget = useMemo(() => {
    return localBudgets.find(budget => budget.id === currentBudgetId) || filteredBudgets[0];
  }, [localBudgets, currentBudgetId, filteredBudgets]);

  // Get current budget status
  const currentStatus = useMemo(() => {
    return currentBudget ? getBudgetStatus(currentBudget) : { status: "N/A", color: "gray" };
  }, [currentBudget]);

  // Prepare chart data
  const prepareChartData = (budget?: Budget) => {
    const targetBudget = budget || currentBudget;
    if (!targetBudget || targetBudget.items.length === 0) return [];
    return targetBudget.items.map((item) => ({
      name: item.category,
      planned: item.planned,
      actual: item.actual,
      remaining: item.remaining,
    }));
  };

  // Prepare pie chart data
  const preparePieChartData = (budget?: Budget) => {
    const targetBudget = budget || currentBudget;
    if (!targetBudget || targetBudget.items.length === 0) return [];
    return targetBudget.items.map((item) => ({
      name: item.category,
      value: item.actual > 0 ? item.actual : 0,
    }));
  };

  return {
    budgets: localBudgets,
    filteredBudgets,
    currentBudget,
    currentBudgetId,
    setCurrentBudgetId,
    activePeriod,
    setActivePeriod,
    isLoading,
    error,
    refetch,
    currentStatus,
    createBudget,
    addBudgetItem,
    deleteBudgetItem,
    deleteBudget,
    updateCategorySpending,
    getBudgetStatus,
    prepareChartData,
    preparePieChartData,
    mutations: {
      create: createBudgetMutation,
      update: updateBudgetMutation,
      delete: deleteBudgetMutation
    }
  };
} 