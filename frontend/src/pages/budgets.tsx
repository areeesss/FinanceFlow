import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Wallet,
  Goal,
  List,
  CreditCard,
  Menu,
  Settings,
  Save,
  Plus,
  Trash2,
  BarChart,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { budgetService } from "@/services/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

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

// Type for NavItem props
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  isSidebarOpen: boolean;
}

const BudgetPage = () => {
  const NavItem = ({
    icon: Icon,
    label,
    active,
    isSidebarOpen,
  }: NavItemProps) => (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3
      rounded-lg cursor-pointer transition-all ${
        active ? "text-indigo-900 font-medium" : "text-gray-400"
      } hover:text-indigo-900 hover:font-medium`}
    >
      {active && (
        <div
          className="absolute left-0 top-0 h-full w-1 bg-indigo-900
        rounded-r-md"
        />
      )}
      <Icon
        size={24}
        className={`transition-all duration-200 ${
          active ? "text-indigo-900" : "text-gray-400"
        } group-hover:text-indigo-900`}
      />
      {isSidebarOpen && (
        <span
          className="transition-opacity duration-200 opacity-100
        group-hover:opacity-100"
        >
          {label}
        </span>
      )}
    </div>
  );

  const { budgets: backendBudgets, loading, error, refreshData } = useFinance();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState("daily"); // Set daily as default
  const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [deleteBudgetAlertOpen, setDeleteBudgetAlertOpen] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);
  const [activeChartView] = useState("bar"); // "bar" or "pie"
  const currencySymbol = "₱"; // Add currency symbol

  // State for new budget form
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetPeriod, setNewBudgetPeriod] = useState("daily");
  const [newBudgetStartDate, setNewBudgetStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBudgetEndDate, setNewBudgetEndDate] = useState("");

  // State for new budget item form
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPlanned, setNewItemPlanned] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Transform backend budgets to frontend format
  const [localBudgets, setLocalBudgets] = useState<Budget[]>([]);
  
  // Map backend budgets to frontend format when they change
  useEffect(() => {
    if (backendBudgets && Array.isArray(backendBudgets)) {
      console.log("Raw budgets data from backend:", backendBudgets);
      const mappedBudgets = backendBudgets.map(mapBackendToFrontend);
      setLocalBudgets(mappedBudgets);
      
      // Set the current budget ID if not set yet
      if (mappedBudgets.length > 0 && !currentBudgetId) {
        setCurrentBudgetId(mappedBudgets[0].id);
      }
    }
  }, [backendBudgets, currentBudgetId]);

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

  // Calculate and set end date based on period
  useEffect(() => {
    const startDate = new Date(newBudgetStartDate);
    let endDate = new Date(startDate);
    
    if (newBudgetPeriod === "daily") {
      // Same day for daily budgets
      setNewBudgetEndDate(newBudgetStartDate);
    } else if (newBudgetPeriod === "weekly") {
      // Add 6 days to make it a 7-day period
      endDate.setDate(startDate.getDate() + 6);
      setNewBudgetEndDate(endDate.toISOString().split('T')[0]);
    } else {
      // Add approximately one month
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      setNewBudgetEndDate(endDate.toISOString().split('T')[0]);
    }
  }, [newBudgetStartDate, newBudgetPeriod]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add a new budget
  const addNewBudget = async () => {
    if (!newBudgetName || !newBudgetPeriod || !newBudgetStartDate || !newBudgetEndDate) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      const newBudgetData = {
        name: newBudgetName,
        totalPlanned: 0, // Start with 0, will be updated when items are added
        totalActual: 0,
        startDate: newBudgetStartDate,
        endDate: newBudgetEndDate,
        period: newBudgetPeriod // Explicitly include the period
      };
      
      console.log("Creating new budget:", newBudgetData);
      const response = await budgetService.create(newBudgetData);
      
      if (response && response.data) {
        await refreshData(); // Refresh data to get updated budgets
        
        setNewBudgetName("");
        setNewBudgetPeriod("daily");
        setNewBudgetDialogOpen(false);
        
        // Set new budget as current
        setCurrentBudgetId(response.data.id);
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Failed to create budget. Please check console for details.");
    }
  };

  // Add a new item to a budget
  const addNewBudgetItem = () => {
    if (!newItemCategory || !newItemPlanned || !editingBudgetId) return;
    
    const updatedBudgets = localBudgets.map((budget) => {
      if (budget.id === editingBudgetId) {
        const newItem = {
          id:
            budget.items.length > 0
              ? Math.max(...budget.items.map((item) => item.id)) + 1
              : 1,
          category: newItemCategory,
          planned: parseFloat(newItemPlanned),
          actual: 0,
          remaining: parseFloat(newItemPlanned),
          progress: 0,
        };
        const updatedItems = [...budget.items, newItem];
        const totalPlanned = updatedItems.reduce(
          (sum, item) => sum + item.planned,
          0
        );
        const totalActual = updatedItems.reduce(
          (sum, item) => sum + item.actual,
          0
        );
        
        // Update backend budget with new items and totals
        updateBackendBudget(budget.id, { 
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual
        });
        
        return {
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual,
        };
      }
      return budget;
    });
    
    setLocalBudgets(updatedBudgets);
    setNewItemCategory("");
    setNewItemPlanned("");
    setNewItemDialogOpen(false);
  };

  // Delete a budget item
  const handleDeleteItem = () => {
    if (!itemToDelete || !editingBudgetId) return;
    
    const updatedBudgets = localBudgets.map((budget) => {
      if (budget.id === editingBudgetId) {
        const updatedItems = budget.items.filter(
          (item) => item.id !== itemToDelete
        );
        const totalPlanned = updatedItems.reduce(
          (sum, item) => sum + item.planned,
          0
        );
        const totalActual = updatedItems.reduce(
          (sum, item) => sum + item.actual,
          0
        );
        
        // Update backend budget with new items and totals
        updateBackendBudget(budget.id, { 
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual
        });
        
        return {
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual,
        };
      }
      return budget;
    });
    
    setLocalBudgets(updatedBudgets);
    setItemToDelete(null);
    setDeleteAlertOpen(false);
  };

  // Delete a budget
  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    
    try {
      await budgetService.delete(budgetToDelete);
      
      // Remove items from localStorage
      try {
        localStorage.removeItem(`budget_items_${budgetToDelete}`);
        
        // Remove period from localStorage
        const periodMap = JSON.parse(localStorage.getItem('budget_periods') || '{}');
        if (periodMap[budgetToDelete]) {
          delete periodMap[budgetToDelete];
          localStorage.setItem('budget_periods', JSON.stringify(periodMap));
        }
      } catch (e) {
        console.error("Error removing budget data from localStorage:", e);
      }
      
      // Update frontend state
      const updatedBudgets = localBudgets.filter(
        (budget) => budget.id !== budgetToDelete
      );
      setLocalBudgets(updatedBudgets);
      
      // If we're deleting the current budget, switch to another one
      if (updatedBudgets.length > 0 && currentBudgetId === budgetToDelete) {
        setCurrentBudgetId(updatedBudgets[0].id);
      } else if (updatedBudgets.length === 0) {
        setCurrentBudgetId(null);
      }
      
      setBudgetToDelete(null);
      setDeleteBudgetAlertOpen(false);
      
      // Refresh data from backend
      await refreshData();
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Failed to delete budget. Please check console for details.");
    }
  };

  // Helper function to update a budget in the backend
  const updateBackendBudget = async (id: number, budget: Budget) => {
    try {
      await budgetService.update(id, {
        name: budget.name,
        totalPlanned: budget.totalPlanned,
        totalActual: budget.totalActual,
        startDate: budget.startDate,
        endDate: budget.endDate,
        period: budget.period, // Make sure to include period
        items: budget.items // Include all items
      });
      console.log(`Successfully updated budget ${id} with period ${budget.period}`);
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error);
      // Show an error message to the user
      // Instead of automatically redirecting on auth errors (which is now handled in api.ts),
      // we provide feedback to the user here
      alert(`There was an error updating your budget. Check the console for details or try reloading the page.`);
    }
  };

  // Filter budgets by period type
  const filteredBudgets = useMemo(() => {
    return localBudgets.filter(budget => budget.period === activePeriod);
  }, [localBudgets, activePeriod]);

  // Get current budget
  const currentBudget = useMemo(() => {
    return localBudgets.find(budget => budget.id === currentBudgetId) || filteredBudgets[0];
  }, [localBudgets, currentBudgetId, filteredBudgets]);

  // Function to update budget category spending
  const updateActualSpending = (
    budgetId: number,
    itemId: number,
    amount: string
  ) => {
    const updatedBudgets = localBudgets.map((budget) => {
      if (budget.id === budgetId) {
        const updatedItems = budget.items.map((item) => {
          if (item.id === itemId) {
            const actual = parseFloat(amount) || 0;
            const remaining = item.planned - actual;
            const progress =
              item.planned > 0
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
        const totalActual = updatedItems.reduce(
          (sum, item) => sum + item.actual,
          0
        );
        
        // Update backend budget with new items and totals
        updateBackendBudget(budget.id, { 
          ...budget,
          items: updatedItems,
          totalActual
        });
        
        return {
          ...budget,
          items: updatedItems,
          totalActual,
        };
      }
      return budget;
    });
    
    setLocalBudgets(updatedBudgets);
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

  // Get current budget status
  const currentStatus = useMemo(() => {
    return currentBudget ? getBudgetStatus(currentBudget) : { status: "N/A", color: "gray" };
  }, [currentBudget]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!currentBudget || currentBudget.items.length === 0) return [];
    return currentBudget.items.map((item) => ({
      name: item.category,
      planned: item.planned,
      actual: item.actual,
      remaining: item.remaining,
    }));
  };

  // Prepare pie chart data
  const preparePieChartData = () => {
    if (!currentBudget || currentBudget.items.length === 0) return [];
    return currentBudget.items.map((item) => ({
      name: item.category,
      value: item.actual > 0 ? item.actual : 0,
    }));
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

  // Update the useEffect to use activePeriod instead of newBudgetPeriod
  useEffect(() => {
    // When tab changes, try to find a budget in the new period
    if (activePeriod) {
      // Filter budgets by the new active period
      const budgetsInPeriod = localBudgets.filter(budget => budget.period === activePeriod);
      
      // If there are budgets in this period, select the first one
      if (budgetsInPeriod.length > 0) {
        setCurrentBudgetId(budgetsInPeriod[0].id);
      } else {
        // If no budgets in this period, don't show any budget
        setCurrentBudgetId(null);
      }
    }
  }, [activePeriod, localBudgets]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-100">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              onClick={refreshData} 
              className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <NavItem
              icon={Home}
              label="Dashboard"
              active={false}
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/income">
            <NavItem
              icon={Wallet}
              label="Income"
              active={false}
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/expenses">
            <NavItem
              icon={CreditCard}
              label="Expenses"
              active={false}
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/financegoal">
            <NavItem
              icon={Goal}
              label="Goals"
              active={false}
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/budgets">
            <NavItem
              icon={List}
              label="Budgets"
              active={true}
              isSidebarOpen={true}
            />
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
                Budgets
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/aboutus">
                <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                  About Us
                </button>
              </Link>

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
        <main className="flex-1 p-4 overflow-y-auto">
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
          {/* Budget Type Tabs */}
          <div className="flex justify-between items-center mb-6">
            <Tabs
              defaultValue="daily"
              value={activePeriod}
              onValueChange={setActivePeriod}
              className="w-full"
            >
              <TabsList className="w-full max-w-md mb-2">
                <TabsTrigger value="daily" className="flex-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex-1">
                  <BarChart className="w-4 h-4 mr-2" />
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Budget Selection */}
          {filteredBudgets.length > 0 ? (
            <div className="mb-6 flex flex-col gap-2">
              <Label htmlFor="budgetSelect">Select Budget: </Label>
              <Button
                onClick={() => {
                  // Pre-set the period based on the active tab
                  setNewBudgetPeriod(activePeriod as "daily" | "weekly" | "monthly");
                  console.log("Setting budget period to:", activePeriod);
                  
                  // Set default dates based on period
                  const today = new Date();
                  setNewBudgetStartDate(today.toISOString().split('T')[0]);
                  
                  let endDate = new Date(today);
                  if (activePeriod === "daily") {
                    // Same day for daily budget
                  } else if (activePeriod === "weekly") {
                    // Add 6 days for a 7-day period
                    endDate.setDate(today.getDate() + 6);
                  } else {
                    // Add 1 month for monthly budget
                    endDate.setMonth(today.getMonth() + 1);
                    endDate.setDate(endDate.getDate() - 1);
                  }
                  
                  setNewBudgetEndDate(endDate.toISOString().split('T')[0]);
                  setNewBudgetDialogOpen(true);
                }}
                className=" bg-indigo-400 hover:bg-indigo-600 w-fit"
              >
                <Plus className="mr-2 h-4 w-4" /> Create New Budget
              </Button>
              <div className="flex gap-4 mt-2 flex-wrap">
                {filteredBudgets.map((budget) => (
                  <Card
                    key={budget.id}
                    className={`cursor-pointer border-2 transition-all ${
                      currentBudgetId === budget.id
                        ? "border-indigo-600"
                        : "border-transparent"
                    }`}
                    onClick={() => setCurrentBudgetId(budget.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{budget.name}</h3>
                          <p className="text-sm text-gray-500">
                            {budget.startDate &&
                              `${budget.startDate} ${
                                budget.endDate ? `- ${budget.endDate}` : ""
                              }`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBudgetToDelete(budget.id);
                            setDeleteBudgetAlertOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null /* empty placeholder, actual empty state is shown below */}
    
          {/* Current Budget Overview */}
          {currentBudget ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>{currentBudget.name} Overview</span>
                    <span
                      className={`text-sm py-1 px-3 rounded-full ${
                        currentStatus.color === "green"
                          ? "bg-green-100 text-green-800"
                          : currentStatus.color === "orange"
                          ? "bg-orange-100 text-orange-800"
                          : currentStatus.color === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {currentStatus.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-sm text-indigo-700 mb-1">
                        Planned Budget
                      </h3>
                      <p className="text-2xl font-bold">
                        {currencySymbol}
                        {currentBudget.totalPlanned.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-sm text-indigo-700 mb-1">
                        Money Spent
                      </h3>
                      <p className="text-2xl font-bold">
                        {currencySymbol}
                        {currentBudget.totalActual.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-sm text-indigo-700 mb-1">
                        Remaining Money
                      </h3>
                      <p className="text-2xl font-bold">
                        {currencySymbol}
                        {(
                          currentBudget.totalPlanned - currentBudget.totalActual
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Budget Visualization and Categories in one row */}
              {currentBudget && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Budget Visualization Card */}
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Budget Visualization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentBudget.items.length > 0 ? (
                        <div className="w-full h-96 ">
                          <ResponsiveContainer width="100%" height="100%">
                            {activeChartView === "bar" ? (
                              <RechartsBarChart
                                data={prepareChartData()}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 70,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={70}
                                />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => `${currencySymbol}${value}`}
                                />
                                <Legend verticalAlign="top" />
                                <Bar
                                  dataKey="planned"
                                  name="Budget"
                                  fill="#8884d8"
                                />
                                <Bar dataKey="actual" name="Spent" fill="#82ca9d" />
                              </RechartsBarChart>
                            ) : (
                              <RechartsPieChart>
                                <Pie
                                  data={preparePieChartData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                ></Pie>
                                <Tooltip
                                  formatter={(value) => `${currencySymbol}${value}`}
                                />
                                <Legend />
                              </RechartsPieChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">
                            Add budget categories to see visualization.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget Categories Card */}
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Budget Categories</CardTitle>
                      <Button
                        className="bg-indigo-400 hover:bg-indigo-600"
                        onClick={() => {
                          setEditingBudgetId(currentBudget.id);
                          setNewItemDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                      {currentBudget.items.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">
                                  Budget
                                </TableHead>
                                <TableHead className="text-center">Spent</TableHead>
                                <TableHead className="text-center">
                                  Remaining
                                </TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentBudget.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">
                                    {item.category}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {currencySymbol}
                                    {item.planned.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                      <Input
                                        type="number"
                                        value={item.actual}
                                        onChange={(e) =>
                                          updateActualSpending(
                                            currentBudget.id,
                                            item.id,
                                            e.target.value
                                          )
                                        }
                                        className="w-20 text-right"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {currencySymbol}
                                    {item.remaining.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setItemToDelete(item.id);
                                        setEditingBudgetId(currentBudget.id);
                                        setDeleteAlertOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">
                            No categories found. Add a category to get started.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            // Only show this empty state when there are NO budgets in the current period
            filteredBudgets.length === 0 && (
              <div className="bg-blue-50 p-10 rounded-xl text-center shadow-sm">
                <p className="text-gray-600 mb-6">No {activePeriod} budgets found. Create a new budget to get started.</p>
                <Button
                  onClick={() => {
                    // Pre-set the period based on the active tab
                    setNewBudgetPeriod(activePeriod as "daily" | "weekly" | "monthly");
                    console.log("Setting budget period to:", activePeriod);
                    
                    // Set default dates based on period
                    const today = new Date();
                    setNewBudgetStartDate(today.toISOString().split('T')[0]);
                    
                    let endDate = new Date(today);
                    if (activePeriod === "daily") {
                      // Same day for daily budget
                    } else if (activePeriod === "weekly") {
                      // Add 6 days for a 7-day period
                      endDate.setDate(today.getDate() + 6);
                    } else {
                      // Add 1 month for monthly budget
                      endDate.setMonth(today.getMonth() + 1);
                      endDate.setDate(endDate.getDate() - 1);
                    }
                    
                    setNewBudgetEndDate(endDate.toISOString().split('T')[0]);
                    setNewBudgetDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Budget
                </Button>
              </div>
            )
          )}
    
          {/* Tips and Suggestions */}
          {currentBudget && (
            <Card>
              <CardHeader>
                <CardTitle>Tips & Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Dynamic suggestions based on budget status */}
                  {currentBudget.totalActual >
                    currentBudget.totalPlanned * 0.9 && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">
                          Budget Alert
                        </h4>
                        <p className="text-sm text-red-700">
                          You've used{" "}
                          {Math.round(
                            (currentBudget.totalActual /
                              currentBudget.totalPlanned) *
                              100
                          )}
                          % of your total budget. Consider reducing spending in
                          non-essential categories.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentBudget.items.some((item) => item.progress > 90) && (
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">
                          Category Alert
                        </h4>
                        <p className="text-sm text-amber-700">
                          Some categories are near or over their budget limits.
                          Consider reallocating funds from categories with
                          remaining budget.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentBudget.items.some((item) => item.progress === 0) && (
                    <div className="flex items-start space-x-2 p-3 bg-indigo-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-indigo-800">
                          Unused Categories
                        </h4>
                        <p className="text-sm text-indigo-700">
                          Some categories have no spending yet. Remember to
                          track all your expenses to keep your budget accurate.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* General tips */}
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Budget Tip</h4>
                      <p className="text-sm text-green-700">
                        Try the 50/30/20 rule: 50% of income on needs, 30% on
                        wants, and 20% on savings and debt repayment.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* New Budget Dialog */}
      <Dialog open={newBudgetDialogOpen} onOpenChange={setNewBudgetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New {newBudgetPeriod.charAt(0).toUpperCase() + newBudgetPeriod.slice(1)} Budget</DialogTitle>
            <DialogDescription>
              Create a new budget to track your spending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget-name">Budget Name</Label>
              <Input
                id="budget-name"
                placeholder="Enter budget name"
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-period">Budget Period</Label>
              <Select
                value={newBudgetPeriod}
                onValueChange={setNewBudgetPeriod}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`${newBudgetPeriod.charAt(0).toUpperCase() + newBudgetPeriod.slice(1)} Budget`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={newBudgetStartDate}
                onChange={(e) => setNewBudgetStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={newBudgetEndDate}
                onChange={(e) => setNewBudgetEndDate(e.target.value)}
                readOnly={newBudgetPeriod !== "custom"}
              />
              <div className="text-xs text-muted-foreground">
                {newBudgetPeriod !== "custom" && "End date is calculated based on the period selected."}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addNewBudget}>Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Budget Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
            <DialogDescription>
              Add a new spending category to your budget.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-category">Category Name</Label>
              <Input
                id="item-category"
                placeholder="e.g., Groceries, Rent, Transportation"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-planned">Planned Amount ({currencySymbol})</Label>
              <Input
                id="item-planned"
                type="number"
                placeholder="Enter amount"
                value={newItemPlanned}
                onChange={(e) => setNewItemPlanned(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addNewBudgetItem}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category and its data from your
              budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Budget Alert */}
      <AlertDialog
        open={deleteBudgetAlertOpen}
        onOpenChange={setDeleteBudgetAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget and all its categories.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteBudgetAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudget}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetPage;
