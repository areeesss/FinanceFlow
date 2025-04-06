import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Define TypeScript interfaces
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  amountSaved: number;
  progress: number;
  deadline: string;
  description?: string;
  _id?: string; // Add _id to support both MongoDB and standard ID fields
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  balance: number;
  goalName?: string;
  goalId?: string;
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

export function useGoals() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [localGoals, setLocalGoals] = useState<Goal[]>([]);

  // Fetch goals data
  const { 
    data: goalsData = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      try {
        console.log("Fetching goals data...");
        const response = await goalService.getAll();
        console.log("Goals data fetched:", response);
        return processApiResponse<any>(response);
      } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Process the raw goals data from the API
  useEffect(() => {
    if (goalsData && Array.isArray(goalsData)) {
      console.log("Raw goals data from backend:", goalsData);
      setLocalGoals(goalsData.map(item => ({
        id: item._id ? item._id.toString() : String(item.id),
        name: item.name || 'Unnamed Goal',
        targetAmount: Number(item.target_amount) || 0,
        amountSaved: Number(item.current_amount) || 0,
        progress: Number(item.progress) || 0,
        deadline: item.deadline || new Date().toISOString().split('T')[0],
        description: item.description || '',
        _id: item._id
      })));
    }
  }, [goalsData]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: any) => goalService.create(data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error("Error adding goal:", error);
      addToast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      goalService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      addToast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error("Failed to delete goal:", error);
      addToast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  });

  // Function to fetch transactions for a specific goal
  const fetchGoalTransactions = async (goalId: string): Promise<Transaction[]> => {
    try {
      // In a real implementation, you'd call an API endpoint
      // For now, we'll use localStorage to simulate
      const savedTransactions = localStorage.getItem(`goal_transactions_${goalId}`);
      if (savedTransactions) {
        return JSON.parse(savedTransactions);
      }
      return [];
    } catch (error) {
      console.error('Error fetching goal transactions:', error);
      return [];
    }
  };

  // Function to save a transaction for a goal
  const saveGoalTransaction = async (goalId: string, transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction[]> => {
    try {
      // In a real implementation, you'd call an API endpoint
      // For now, we'll use localStorage to simulate
      const existingTransactions = await fetchGoalTransactions(goalId);
      const updatedTransactions = [...existingTransactions, {
        ...transaction,
        id: Date.now().toString(),
        date: new Date().toISOString()
      }];
      localStorage.setItem(`goal_transactions_${goalId}`, JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error saving goal transaction:', error);
      return [];
    }
  };

  // Update goal amount mutation
  const updateGoalAmountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      goalService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal amount updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error("Error updating goal amount:", error);
      addToast({
        title: "Error",
        description: "Failed to update goal amount",
        variant: "destructive",
      });
    }
  });

  // Function to add funds to a goal
  const addFundsToGoal = async (
    goal: Goal,
    amount: number,
    transactionDescription: string = ""
  ) => {
    if (!goal || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please provide a valid goal and amount",
        variant: "destructive",
      });
      return;
    }

    const updatedAmount = goal.amountSaved + amount;
    
    const updatedGoal = {
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: updatedAmount,
      deadline: goal.deadline,
      description: `Goal for ${goal.name}`
    };
    
    try {
      await updateGoalAmountMutation.mutateAsync({ 
        id: goal.id, 
        data: updatedGoal 
      });
      
      // Save the transaction
      await saveGoalTransaction(goal.id, {
        type: 'deposit',
        amount,
        description: transactionDescription || `Added funds to ${goal.name}`,
        balance: updatedAmount
      });
      
      return true;
    } catch (error) {
      console.error('Error adding funds:', error);
      return false;
    }
  };

  // Function to withdraw funds from a goal
  const withdrawFundsFromGoal = async (
    goal: Goal,
    amount: number,
    transactionDescription: string = ""
  ) => {
    if (!goal || amount <= 0 || amount > goal.amountSaved) {
      addToast({
        title: "Error",
        description: amount > goal.amountSaved 
          ? "You cannot withdraw more than your current savings" 
          : "Please provide a valid goal and amount",
        variant: "destructive",
      });
      return;
    }

    const updatedAmount = goal.amountSaved - amount;
    
    const updatedGoal = {
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: updatedAmount,
      deadline: goal.deadline,
      description: `Goal for ${goal.name}`
    };
    
    try {
      await updateGoalAmountMutation.mutateAsync({
        id: goal.id,
        data: updatedGoal
      });
      
      // Save the transaction
      await saveGoalTransaction(goal.id, {
        type: 'withdrawal',
        amount,
        description: transactionDescription || `Withdrew funds from ${goal.name}`,
        balance: updatedAmount
      });
      
      return true;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      return false;
    }
  };

  // Function to transfer funds between goals
  const transferFunds = async (
    sourceGoal: Goal,
    targetGoal: Goal,
    amount: number,
    transactionDescription: string = ""
  ) => {
    if (!sourceGoal || !targetGoal || amount <= 0 || amount > sourceGoal.amountSaved) {
      addToast({
        title: "Error",
        description: amount > sourceGoal.amountSaved 
          ? "You cannot transfer more than your current savings" 
          : "Please provide valid goals and amount",
        variant: "destructive",
      });
      return;
    }

    // Calculate updated values
    const sourceUpdatedAmount = sourceGoal.amountSaved - amount;
    const targetUpdatedAmount = targetGoal.amountSaved + amount;
    
    // Update source goal with correct field names
    const sourceGoalUpdate = {
      name: sourceGoal.name,
      target_amount: sourceGoal.targetAmount,
      current_amount: sourceUpdatedAmount,
      deadline: sourceGoal.deadline,
      description: `Transfer to ${targetGoal.name}`
    };
    
    try {
      // First withdraw from source goal
      await updateGoalAmountMutation.mutateAsync({
        id: sourceGoal.id,
        data: sourceGoalUpdate
      });
      
      // Update target goal with correct field names
      const targetGoalUpdate = {
        name: targetGoal.name,
        target_amount: targetGoal.targetAmount,
        current_amount: targetUpdatedAmount,
        deadline: targetGoal.deadline,
        description: `Transfer from ${sourceGoal.name}`
      };
      
      // Then add to target goal
      await updateGoalAmountMutation.mutateAsync({
        id: targetGoal.id,
        data: targetGoalUpdate
      });
      
      // Save withdrawal transaction
      await saveGoalTransaction(sourceGoal.id, {
        type: 'withdrawal',
        amount,
        description: transactionDescription || `Transfer to ${targetGoal.name}`,
        balance: sourceUpdatedAmount
      });
      
      // Save deposit transaction
      await saveGoalTransaction(targetGoal.id, {
        type: 'deposit',
        amount,
        description: transactionDescription || `Transfer from ${sourceGoal.name}`,
        balance: targetUpdatedAmount
      });
      
      return true;
    } catch (error) {
      console.error('Error transferring funds:', error);
      return false;
    }
  };

  return {
    goals: localGoals,
    isLoading,
    error,
    refetch,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    fetchGoalTransactions,
    saveGoalTransaction,
    addFundsToGoal,
    withdrawFundsFromGoal,
    transferFunds,
    mutations: {
      create: createGoalMutation,
      update: updateGoalMutation,
      delete: deleteGoalMutation,
      updateAmount: updateGoalAmountMutation
    }
  };
} 