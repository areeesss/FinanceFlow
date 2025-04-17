import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Home,
  Wallet,
  Goal,
  List,
  CreditCard,
  Menu,
  Settings,
  Save,
  PiggyBank,
  Plus,
  Trash2,
  Minus,
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import userimg from "@/assets/imgs/user.webp";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { goalService } from "@/services/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatCurrency } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define TypeScript interfaces
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  amountSaved: number;
  progress: number;
  deadline: string;
  description?: string;
  _id?: string;
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

const FinanceGoal = () => {
  // Define prop types for the NavItem component
  interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    isSidebarOpen: boolean;
  }

  const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    active,
    isSidebarOpen,
  }) => (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
        active ? "text-indigo-900 font-medium" : "text-gray-400"
      } hover:text-indigo-900 hover:font-medium`}
    >
      {active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-indigo-900 rounded-r-md" />
      )}
      <Icon
        size={24}
        className={`transition-all duration-200 ${
          active ? "text-indigo-900" : "text-gray-400"
        } group-hover:text-indigo-900`}
      />
      {isSidebarOpen && (
        <span className="transition-opacity duration-200 opacity-100 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );

  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get user data from auth context
  const { user } = useAuth();
  
  // Initialize state with values from user context if available
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // TanStack Query to fetch goals
  const { 
    data: goalsData = [], 
    isLoading,
    error
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

  // State to store processed goals data
  const [localGoals, setLocalGoals] = useState<Goal[]>([]);

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

  // Define mutations for CRUD operations
  const createGoalMutation = useMutation({
    mutationFn: (data: any) => goalService.create(data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal added successfully",
      });
      setAddGoalOpen(false);
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

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      goalService.update(id, data),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal updated successfully",
      });
      setEditGoalOpen(false);
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

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Goal deleted successfully",
      });
      setDeleteGoalOpen(false);
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

  // Add mutation for updating the amount
  const updateGoalAmountMutation = useMutation({
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
      console.error("Error updating goal amount:", error);
      addToast({
        title: "Error",
        description: "Failed to update goal amount",
        variant: "destructive",
      });
    }
  });

  // New state for dialogs
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false);
  const [withdrawFundsOpen, setWithdrawFundsOpen] = useState(false);
  const [transferFundsOpen, setTransferFundsOpen] = useState(false);
  const [fundsToTransfer, setFundsToTransfer] = useState("");
  const [transferTargetGoalId, setTransferTargetGoalId] = useState<string>("");

  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  // Form states
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newSavedAmount, setNewSavedAmount] = useState("");
  const [fundsToAdd, setFundsToAdd] = useState("");
  const [fundsToWithdraw, setFundsToWithdraw] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [goalTransactions, setGoalTransactions] = useState<Transaction[]>([]);

  // State for all transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

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

  // Function to open add goal dialog
  const openAddGoalDialog = () => {
    setNewGoalName("");
    setNewGoalAmount("");
    setNewGoalDeadline("");
    setAddGoalOpen(true);
  };

  // Function to open edit goal dialog
  const openEditGoalDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalAmount(goal.targetAmount.toString());
    setNewSavedAmount(goal.amountSaved.toString());
    setNewGoalDeadline(goal.deadline);
    setEditGoalOpen(true);
  };

  // Function to open delete goal confirmation dialog
  const openDeleteGoalDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setDeleteGoalOpen(true);
  };

  // Function to open add funds dialog
  const openAddFundsDialog = async (goal: Goal) => {
    setCurrentGoal(goal);
    setFundsToAdd("");
    setTransactionDescription("");
    setAddFundsOpen(true);
    
    // Fetch transactions for this goal
    const transactions = await fetchGoalTransactions(goal.id);
    setGoalTransactions(transactions);
  };

  // Function to open withdraw funds dialog
  const openWithdrawFundsDialog = async (goal: Goal) => {
    setCurrentGoal(goal);
    setFundsToWithdraw("");
    setTransactionDescription("");
    setWithdrawFundsOpen(true);
    
    // Fetch transactions for this goal
    const transactions = await fetchGoalTransactions(goal.id);
    setGoalTransactions(transactions);
  };

  // Function to open transfer funds dialog
  const openTransferFundsDialog = async (sourceGoal: Goal) => {
    setCurrentGoal(sourceGoal);
    setFundsToTransfer("");
    setTransferTargetGoalId("");
    setTransactionDescription("");
    setTransferFundsOpen(true);
  };

  const navigate = useNavigate();

  // Function to handle adding a new goal
  const handleAddGoal = async () => {
    if (!newGoalName || !newGoalAmount || !newGoalDeadline) {
      addToast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid target amount",
        variant: "destructive",
      });
      return;
    }

    // Format the data to match what the backend expects (field names match Django model)
    const formattedGoal = {
      name: newGoalName,
      target_amount: targetAmount,
      current_amount: 0, // Default to 0 for new goal
      deadline: newGoalDeadline,
      description: `Goal for ${newGoalName}`
      // No need to include user as the backend will add the authenticated user
    };

    try {
      console.log("Sending goal data to backend:", formattedGoal);
      await createGoalMutation.mutateAsync(formattedGoal);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  // Function to handle editing a goal
  const handleEditGoal = async () => {
    if (!currentGoal || !newGoalName || !newGoalAmount || !newGoalDeadline || !newSavedAmount) {
      addToast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid target amount",
        variant: "destructive",
      });
      return;
    }

    const amountSaved = parseFloat(newSavedAmount);
    if (isNaN(amountSaved) || amountSaved < 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid saved amount",
        variant: "destructive",
      });
      return;
    }

    // Format the data to match what the backend expects (field names match Django model)
    const updatedGoal = {
      name: newGoalName,
      target_amount: targetAmount,
      current_amount: amountSaved,
      deadline: newGoalDeadline,
      description: `Goal for ${newGoalName}`
      // progress is calculated by the backend
    };

    try {
      console.log("Updating goal with data:", updatedGoal);
      await updateGoalMutation.mutateAsync({ id: currentGoal.id, data: updatedGoal });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Function to handle deleting a goal
  const handleDeleteGoal = async () => {
    if (!currentGoal) return;

    try {
      await deleteGoalMutation.mutateAsync(currentGoal.id);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Function to handle adding funds to a goal
  const handleAddFunds = async () => {
    if (!currentGoal || !fundsToAdd) {
      addToast({
        title: "Error",
        description: "Please enter an amount to add",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundsToAdd);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const updatedAmount = currentGoal.amountSaved + amount;
    
    const updatedGoal = {
      name: currentGoal.name,
      target_amount: currentGoal.targetAmount,
      current_amount: updatedAmount,
      deadline: currentGoal.deadline,
      description: `Goal for ${currentGoal.name}`
    };
    
    updateGoalAmountMutation.mutate({ 
      id: currentGoal.id, 
      data: updatedGoal 
    }, {
      onSuccess: async () => {
        // Save the transaction
        await saveGoalTransaction(currentGoal.id, {
          type: 'deposit',
          amount: amount,
          description: transactionDescription || `Added funds to ${currentGoal.name}`,
          balance: updatedAmount
        });
        
        setAddFundsOpen(false);
      }
    });
  };

  // Function to handle withdrawing funds from a goal
  const handleWithdrawFunds = async () => {
    if (!currentGoal || !fundsToWithdraw) {
      addToast({
        title: "Error",
        description: "Please enter an amount to withdraw",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundsToWithdraw);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentGoal.amountSaved) {
      addToast({
        title: "Error",
        description: "You cannot withdraw more than your current savings",
        variant: "destructive",
      });
      return;
    }

    const updatedAmount = currentGoal.amountSaved - amount;
    
    const updatedGoal = {
      name: currentGoal.name,
      target_amount: currentGoal.targetAmount,
      current_amount: updatedAmount,
      deadline: currentGoal.deadline,
      description: `Goal for ${currentGoal.name}`
    };
    
    updateGoalAmountMutation.mutate({
      id: currentGoal.id,
      data: updatedGoal
    }, {
      onSuccess: async () => {
        // Save the transaction
        await saveGoalTransaction(currentGoal.id, {
          type: 'withdrawal',
          amount: amount,
          description: transactionDescription || `Withdrew funds from ${currentGoal.name}`,
          balance: updatedAmount
        });
        
        setWithdrawFundsOpen(false);
      }
    });
  };

  // Function to handle transferring funds between goals
  const handleTransferFunds = async () => {
    if (!currentGoal || !fundsToTransfer || !transferTargetGoalId) {
      addToast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(fundsToTransfer);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentGoal.amountSaved) {
      addToast({
        title: "Error",
        description: "You cannot transfer more than your current savings",
        variant: "destructive",
      });
      return;
    }

    const targetGoal = localGoals.find(g => g.id === transferTargetGoalId);
    if (!targetGoal) {
      addToast({
        title: "Error",
        description: "Target goal not found",
        variant: "destructive",
      });
      return;
    }

    // Calculate updated values
    const sourceUpdatedAmount = currentGoal.amountSaved - amount;
    const targetUpdatedAmount = targetGoal.amountSaved + amount;
    
    // Update source goal with correct field names
    const sourceGoalUpdate = {
      name: currentGoal.name,
      target_amount: currentGoal.targetAmount,
      current_amount: sourceUpdatedAmount,
      deadline: currentGoal.deadline,
      description: `Transfer to ${targetGoal.name}`
    };
    
    // First withdraw from source goal
    updateGoalAmountMutation.mutate({
      id: currentGoal.id,
      data: sourceGoalUpdate
    }, {
      onSuccess: async () => {
        // Update target goal with correct field names
        const targetGoalUpdate = {
          name: targetGoal.name,
          target_amount: targetGoal.targetAmount,
          current_amount: targetUpdatedAmount,
          deadline: targetGoal.deadline,
          description: `Transfer from ${currentGoal.name}`
        };
        
        // Then add to target goal
        updateGoalAmountMutation.mutate({
          id: targetGoal.id,
          data: targetGoalUpdate
        }, {
          onSuccess: async () => {
            // Save withdrawal transaction
            await saveGoalTransaction(currentGoal.id, {
              type: 'withdrawal',
              amount: amount,
              description: transactionDescription || `Transfer to ${targetGoal.name}`,
              balance: sourceUpdatedAmount
            });
            
            // Save deposit transaction
            await saveGoalTransaction(targetGoal.id, {
              type: 'deposit',
              amount: amount,
              description: transactionDescription || `Transfer from ${currentGoal.name}`,
              balance: targetUpdatedAmount
            });
            
            setTransferFundsOpen(false);
          }
        });
      }
    });
  };

  // Format date values
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Fetch all transactions for all goals
  useEffect(() => {
    const fetchAllTransactions = async () => {
      if (localGoals && localGoals.length > 0) {
        let transactions: Transaction[] = [];
        
        for (const goal of localGoals) {
          const goalTransactions = await fetchGoalTransactions(goal.id);
          if (goalTransactions.length > 0) {
            // Add goal name to each transaction
            transactions = [
              ...transactions,
              ...goalTransactions.map((tx: Transaction) => ({
                ...tx,
                goalName: goal.name,
                goalId: goal.id
              }))
            ];
          }
        }
        
        // Sort by date, newest first
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setAllTransactions(transactions);
      }
    };
    
    fetchAllTransactions();
  }, [localGoals]);
  
  return (
    <div className="flex h-screen bg-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 z-50 h-screen bg-white shadow-md p-4 transition-all duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-48 md:flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16">
          <img
            src={darkfont}
            alt="Logo"
            className="w-32 transition-all duration-300"
          />
          <button onClick={toggleSidebar} className="p-2 rounded-md md:hidden">
            <Menu size={24} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-6 space-y-2">
          <Link to="/dashboard">
            <NavItem icon={Home} label="Dashboard" isSidebarOpen={true} />
          </Link>
          <Link to="/income">
            <NavItem icon={Wallet} label="Income" isSidebarOpen={true} />
          </Link>
          <Link to="/expenses">
            <NavItem icon={CreditCard} label="Expenses" isSidebarOpen={true} />
          </Link>
          <Link to="/financegoal">
            <NavItem icon={Goal} label="Goals" active isSidebarOpen={true} />
          </Link>
          <Link to="/budgets">
            <NavItem icon={List} label="Budgets" isSidebarOpen={true} />
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Menu toggle button - only visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu size={24} />
              </Button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">
                Goals 
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/aboutus">
                <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                  About Us
                </button>
              </Link>

              {/* Avatar with Dropdown */}
              {/* Avatar with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <img
                      src={userimg}
                      alt="User"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white shadow-lg rounded-md"
                >
                  {/* ✅ Clicking View Profile opens the popover but doesn't close it when moving mouse */}
                  <Popover
                    open={openPopover}
                    onOpenChange={setOpenPopover}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()} // Prevents dropdown from closing
                        onClick={() => setOpenPopover(true)}
                      >
                        View Profile
                      </DropdownMenuItem>
                    </PopoverTrigger>
                    <PopoverContent
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "center" : "start"}
                      className="w-[60vw] max-w-xs sm:max-w-sm md:w-80 p-3 sm:p-4 bg-white shadow-lg rounded-md"
                      sideOffset={isMobile ? 5 : 10}
                    >
                      {/* Personal Information */}
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-3 sm:p-4 pb-2 rounded-lg border bg-gray-100">
                        {/* Toggle button - with more space below content */}
                        <button
                          className="absolute bottom-2 right-2 text-gray-600 hover:text-gray-800"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? (
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                            <img
                              src={userimg}
                              alt="User"
                              className="h-full w-full object-cover rounded-full"
                            />
                          </Avatar>

                          <div className="w-full overflow-hidden">
                            {isEditing ? (
                              <div className="flex flex-col space-y-2 mb-6">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="Full Name"
                                />
                                <input
                                  type="email"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Email"
                                />
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  placeholder="Username"
                                />
                              </div>
                            ) : (
                              <div className="overflow-hidden">
                                <p className="text-base sm:text-lg font-bold truncate">
                                  {fullName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {email}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  Username: {username}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div className="flex-1 pr-2">
                          <h3 className="text-sm sm:text-md font-semibold">
                            Notification Settings
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Manage how you receive alerts
                          </p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>

                      {/* Email Notifications */}
                      <div className="mt-2 p-3 sm:p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div className="flex-1 pr-2">
                          <h3 className="text-sm sm:text-md font-semibold">
                            Email Notifications
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Weekly summaries and alerts
                          </p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 overflow-y-auto">
          {/* Logout Confirmation Dialog */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-indigo-100 hover:bg-indigo-300"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-indigo-100 hover:bg-indigo-300 text-black"
                  onClick={() => navigate("/login")}
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Goal Dialog */}
          <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Financial Goal</DialogTitle>
                <DialogDescription>
                  Create a new savings goal to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    placeholder="e.g., Vacation, Emergency Fund"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Target Amount (₱)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="5000"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddGoalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleAddGoal}
                >
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Goal Dialog */}
          <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Financial Goal</DialogTitle>
                <DialogDescription>
                  Update your savings goal details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editGoalName">Goal Name</Label>
                  <Input
                    id="editGoalName"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTargetAmount">Target Amount (₱)</Label>
                  <Input
                    id="editTargetAmount"
                    type="number"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editSavedAmount">Saved Amount (₱)</Label>
                  <Input
                    id="editSavedAmount"
                    type="number"
                    value={newSavedAmount}
                    onChange={(e) => setNewSavedAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDeadline">Target Date</Label>
                  <Input
                    id="editDeadline"
                    type="date"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                  />
                </div>
                {currentGoal && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      Current progress: {currentGoal.progress}%
                    </div>
                    <Progress
                      value={currentGoal.progress}
                      className="h-2 flex-1"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditGoalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleEditGoal}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Goal Confirmation Dialog */}
          <AlertDialog open={deleteGoalOpen} onOpenChange={setDeleteGoalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
                <AlertDialogDescription>
                  {currentGoal &&
                    `Are you sure you want to delete "${currentGoal.name}"? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-indigo-100 hover:bg-indigo-300"
                  onClick={() => setDeleteGoalOpen(false)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteGoal}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Funds Dialog */}
          <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Funds to Goal</DialogTitle>
                <DialogDescription>
                  {currentGoal
                    ? `Update your savings for ${currentGoal.name}`
                    : "Update your savings"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {currentGoal && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span>Current savings:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.amountSaved)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.targetAmount)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={currentGoal.progress}
                        className="h-2 w-full"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{currentGoal.progress}% complete</span>
                        <span>
                          {formatCurrency(
                            currentGoal.targetAmount - currentGoal.amountSaved
                          )}{" "}
                          remaining
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="fundsAmount">Amount to Add (₱)</Label>
                  <Input
                    id="fundsAmount"
                    type="number"
                    placeholder="500"
                    value={fundsToAdd}
                    onChange={(e) => setFundsToAdd(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transactionDescription">Description (optional)</Label>
                  <Input
                    id="transactionDescription"
                    placeholder="e.g., Bonus from work"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                  />
                </div>

                {goalTransactions.length > 0 && (
                  <div className="mt-2">
                    <Label className="mb-2 block">Recent Transactions</Label>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2 text-sm">
                      {goalTransactions
                        .filter(tx => tx.type === 'deposit')
                        .slice(0, 5)
                        .map(tx => (
                          <div key={tx.id} className="flex justify-between py-1 border-b border-gray-100">
                            <div className="text-green-600 flex items-center gap-1">
                              <Plus size={12} />
                              <span>{formatCurrency(tx.amount)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(tx.date).slice(0, 6)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddFundsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleAddFunds}
                >
                  Add Funds
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Withdraw Funds Dialog */}
          <Dialog open={withdrawFundsOpen} onOpenChange={setWithdrawFundsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Withdraw Funds from Goal</DialogTitle>
                <DialogDescription>
                  {currentGoal
                    ? `Withdraw from your savings for ${currentGoal.name}`
                    : "Withdraw from your savings"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {currentGoal && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span>Current savings:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.amountSaved)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.targetAmount)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={currentGoal.progress}
                        className="h-2 w-full"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{currentGoal.progress}% complete</span>
                        <span>
                          {formatCurrency(
                            currentGoal.targetAmount - currentGoal.amountSaved
                          )}{" "}
                          remaining
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="withdrawAmount">Amount to Withdraw (₱)</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="500"
                    value={fundsToWithdraw}
                    onChange={(e) => setFundsToWithdraw(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="withdrawDescription">Description (optional)</Label>
                  <Input
                    id="withdrawDescription"
                    placeholder="e.g., Emergency expense"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                  />
                </div>

                {goalTransactions.length > 0 && (
                  <div className="mt-2">
                    <Label className="mb-2 block">Recent Transactions</Label>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-2 text-sm">
                      {goalTransactions
                        .filter(tx => tx.type === 'withdrawal')
                        .slice(0, 5)
                        .map(tx => (
                          <div key={tx.id} className="flex justify-between py-1 border-b border-gray-100">
                            <div className="text-red-600 flex items-center gap-1">
                              <Minus size={12} />
                              <span>{formatCurrency(tx.amount)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(tx.date).slice(0, 6)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWithdrawFundsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleWithdrawFunds}
                >
                  Withdraw Funds
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Transfer Funds Dialog */}
          <Dialog open={transferFundsOpen} onOpenChange={setTransferFundsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Transfer Funds Between Goals</DialogTitle>
                <DialogDescription>
                  {currentGoal
                    ? `Transfer funds from ${currentGoal.name} to another goal`
                    : "Transfer funds between goals"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {currentGoal && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span>Source goal:</span>
                      <span className="font-semibold">
                        {currentGoal.name}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Available funds:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.amountSaved)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="transferAmount">Amount to Transfer (₱)</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="500"
                    value={fundsToTransfer}
                    onChange={(e) => setFundsToTransfer(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetGoal">Transfer to Goal</Label>
                  <select
                    id="targetGoal"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={transferTargetGoalId}
                    onChange={(e) => setTransferTargetGoalId(e.target.value)}
                  >
                    <option value="" disabled>Select a goal</option>
                    {localGoals
                      .filter(g => g.id !== currentGoal?.id)
                      .map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name} ({formatCurrency(goal.amountSaved)} / {formatCurrency(goal.targetAmount)})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transferDescription">Description (optional)</Label>
                  <Input
                    id="transferDescription"
                    placeholder="e.g., Moving emergency funds to vacation"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTransferFundsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleTransferFunds}
                >
                  Transfer Funds
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Top Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 flex">Total Savings</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(
                      localGoals.reduce((sum, goal) => sum + goal.amountSaved, 0)
                    )}
                  </h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <PiggyBank className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Active Goals</p>
                  <h3 className="text-2xl font-bold">{localGoals.length}</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <List className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Average Progress</p>
                  <h3 className="text-2xl font-bold">
                    {localGoals.length
                      ? Math.round(
                          localGoals.reduce((sum, goal) => sum + goal.progress, 0) /
                            localGoals.length
                        )
                      : 0}
                    %
                  </h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>
          </div>

          {/* Goals Table */}
          <Card className="shadow-md">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <h2 className="md:text-base text-xl font-semibold">
                  Financial Goals
                </h2>
                <Button
                  className="bg-indigo-500 hover:bg-indigo-600"
                  onClick={openAddGoalDialog}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="text-center text-red-500">
                  <p>{error.message}</p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['goals'] })} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : localGoals.length === 0 ? (
                <div className="text-center py-8">
                  <p>No goals found. Create your first financial goal!</p>
                  <Button
                    className="mt-2 bg-indigo-900 hover:bg-indigo-700"
                    onClick={openAddGoalDialog}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Goal
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Goal Name</TableHead>
                      <TableHead className="text-center">Target</TableHead>
                      <TableHead className="text-center">Saved</TableHead>
                      <TableHead className="text-center">Progress</TableHead>
                      <TableHead className="text-center">Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localGoals.map((goal) => (
                      <TableRow key={goal.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {goal.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(goal.targetAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(goal.amountSaved)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={goal.progress}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-gray-500 min-w-[36px]">
                              {goal.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(goal.deadline)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openAddFundsDialog(goal)}
                              title="Add Funds"
                            >
                              <Plus className="h-4 w-4 text-indigo-900" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openWithdrawFundsDialog(goal)}
                              title="Withdraw Funds"
                            >
                              <Minus className="h-4 w-4 text-red-500" />
                            </Button>
                            {localGoals.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openTransferFundsDialog(goal)}
                                title="Transfer Funds"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="h-4 w-4 text-blue-500"
                                >
                                  <path d="M17 3L21 7L17 11"></path>
                                  <path d="M21 7H13"></path>
                                  <path d="M7 21L3 17L7 13"></path>
                                  <path d="M3 17H11"></path>
                                </svg>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditGoalDialog(goal)}
                              title="Edit Goal"
                            >
                              <Settings className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteGoalDialog(goal)}
                              title="Delete Goal"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="shadow-md mt-6">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <h2 className="md:text-base text-xl font-semibold">
                  Transaction History
                </h2>
              </div>
              </CardHeader>
            <CardContent className="p-4">
              {allTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p>No transactions found. Add funds to your goals to see transaction history.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.goalName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'deposit' ? (
                              <div className="flex items-center text-green-600">
                                <Plus size={16} />
                                <span>Deposit</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <Minus size={16} />
                                <span>Withdrawal</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={`text-right ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              </CardContent>
            </Card>
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default FinanceGoal;