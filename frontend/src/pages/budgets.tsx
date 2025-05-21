import { useState, useEffect } from "react";
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
import darkfont from "/assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import userimg from "/assets/imgs/user.webp";
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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useBudgets } from "@/hooks";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface BudgetItem {
  id: number;
  category: string; 
  planned: number;
  actual: number;
  remaining: number;
  progress: number;
}

// Export the Budget type so it can be used elsewhere
export type Budget = {
  id: number;
  name: string;
  period: "daily" | "weekly" | "monthly";
  items: BudgetItem[];
  totalPlanned: number;
  totalActual: number;
  startDate?: string;
  endDate?: string;
}

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

  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use our custom useBudgets hook
  const {
    filteredBudgets,
    currentBudget,
    currentBudgetId,
    setCurrentBudgetId,
    activePeriod,
    setActivePeriod,
    isLoading,
    error,
    currentStatus,
    createBudget,
    addBudgetItem,
    deleteBudgetItem,
    deleteBudget,
    updateCategorySpending,
    prepareChartData,
    preparePieChartData,
    mutations
  } = useBudgets();
  
  // UI state only for components that don't conflict with the hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [deleteBudgetAlertOpen, setDeleteBudgetAlertOpen] = useState(false);
  const [activeChartView] = useState("bar");

  // State for user profile
  const [openPopover, setOpenPopover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");

  // State for new budget form
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [newBudgetStartDate, setNewBudgetStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBudgetEndDate, setNewBudgetEndDate] = useState("");

  // State for new budget item form
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPlanned, setNewItemPlanned] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Format currency function 
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
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
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newBudgetData = {
        name: newBudgetName,
        period: newBudgetPeriod,
        startDate: newBudgetStartDate,
        endDate: newBudgetEndDate
      };
      
      console.log("Creating new budget:", newBudgetData);
      await createBudget(newBudgetData);
      
      // Reset the form
      setNewBudgetName("");
      setNewBudgetPeriod("daily");
      setNewBudgetDialogOpen(false);
    } catch (error) {
      console.error("Error creating budget:", error);
      addToast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  // Add a new item to a budget
  const addNewBudgetItem = async () => {
    if (!newItemCategory || !newItemPlanned || !editingBudgetId) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const plannedAmount = parseFloat(newItemPlanned);
    if (isNaN(plannedAmount) || plannedAmount < 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create the budget item data
      const itemData = {
        category: newItemCategory,
        planned: plannedAmount
      };
      
      // Call the hook function
      await addBudgetItem(editingBudgetId, itemData);
      
      // Reset form and close dialog
      setNewItemCategory("");
      setNewItemPlanned("");
      setNewItemDialogOpen(false);
      
    } catch (error) {
      console.error("Error adding budget item:", error);
      addToast({
        title: "Error",
        description: "Failed to add budget item",
        variant: "destructive",
      });
    }
  };

  // Delete a budget item
  const handleDeleteItem = async () => {
    if (!currentBudgetId || !itemToDelete) return;
    
    try {
      // Call the hook's deleteBudgetItem function
      await deleteBudgetItem(currentBudgetId, itemToDelete);
      
      setDeleteAlertOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting budget item:", error);
      addToast({
        title: "Error",
        description: "Failed to delete budget item",
        variant: "destructive",
      });
    }
  };

  // Delete a budget
  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    
    try {
      // Call the hook's deleteBudget function
      await deleteBudget(budgetToDelete);
      
      setDeleteBudgetAlertOpen(false);
      setBudgetToDelete(null);
      
      // If we're deleting the current budget, the hook will handle selecting another one
    } catch (error) {
      console.error("Error deleting budget:", error);
      addToast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  // Update budget category spending
  const updateActualSpending = async (
    budgetId: number,
    itemId: number,
    amountStr: string
  ) => {
    if (!budgetId) return;
    
    try {
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount < 0) {
        addToast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      
      // Use the hook function to update category spending
      await updateCategorySpending(budgetId, itemId, amount);
    } catch (error) {
      console.error("Error updating category spending:", error);
      addToast({
        title: "Error",
        description: "Failed to update spending",
        variant: "destructive",
      });
    }
  };

  // Fix Tabs onValueChange type
  const handlePeriodChange = (value: string) => {
    setActivePeriod(value as "daily" | "weekly" | "monthly");
  };

  // Handler for the newBudgetPeriod selection
  const handleNewBudgetPeriodChange = (value: string) => {
    setNewBudgetPeriod(value as "daily" | "weekly" | "monthly");
  };

  // Loading state handler
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Error state handler
  if (error) {
    console.error("Error loading budgets:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Budgets</h1>
        <p className="text-gray-600 mb-6">
          We couldn't load your budget data. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
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
            <div className="flex items-center gap-4 w-full">
              <Tabs
                defaultValue={activePeriod}
                value={activePeriod}
                onValueChange={handlePeriodChange}
                className="flex-1"
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
              <Button
                onClick={() => {
                  setNewBudgetPeriod(activePeriod as "daily" | "weekly" | "monthly");
                  const today = new Date();
                  setNewBudgetStartDate(today.toISOString().split('T')[0]);
                  
                  let endDate = new Date(today);
                  if (activePeriod === "daily") {
                    // Same day for daily budget
                  } else if (activePeriod === "weekly") {
                    endDate.setDate(today.getDate() + 6);
                  } else {
                    endDate.setMonth(today.getMonth() + 1);
                    endDate.setDate(endDate.getDate() - 1);
                  }
                  
                  setNewBudgetEndDate(endDate.toISOString().split('T')[0]);
                  setNewBudgetDialogOpen(true);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={mutations.create.isPending}
              >
                {mutations.create.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Create New Budget
                  </>
                )}
              </Button>
            </div>
          </div>
          {/* Budget Selection */}
          {filteredBudgets.length > 0 ? (
            <div className="mb-6 flex flex-col gap-2">
              <Label htmlFor="budgetSelect">Select Budget: </Label>
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
                          disabled={mutations.delete.isPending}
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
                        {formatCurrency(currentBudget.totalPlanned)}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-sm text-indigo-700 mb-1">
                        Money Spent
                      </h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(currentBudget.totalActual)}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-sm text-indigo-700 mb-1">
                        Remaining Money
                      </h3>
                      <p className="text-2xl font-bold">
                        {formatCurrency(currentBudget.totalPlanned - currentBudget.totalActual)}
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
                                data={prepareChartData(currentBudget)}
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
                                  formatter={(value) => formatCurrency(Number(value))}
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
                                  data={preparePieChartData(currentBudget)}
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
                                  formatter={(value) => formatCurrency(Number(value))}
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
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={() => {
                          setEditingBudgetId(currentBudget.id);
                          setNewItemDialogOpen(true);
                        }}
                        disabled={mutations.update.isPending}
                      >
                        {mutations.update.isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" /> Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                          </>
                        )}
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
                                    {formatCurrency(item.planned)}
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
                                        disabled={mutations.update.isPending}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {formatCurrency(item.remaining)}
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
                                      disabled={mutations.update.isPending}
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
                    setNewBudgetPeriod(activePeriod);
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
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  disabled={mutations.create.isPending}
                >
                  {mutations.create.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Budget
                    </>
                  )}
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
                onValueChange={handleNewBudgetPeriodChange}
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
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={newBudgetEndDate}
                onChange={(e) => setNewBudgetEndDate(e.target.value)}
                min={newBudgetStartDate}
              />
              <div className="text-xs text-muted-foreground">
                End date is calculated based on the period selected.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addNewBudget} 
              disabled={mutations.create.isPending}
            >
              {mutations.create.isPending ? "Creating..." : "Create Budget"}
            </Button>
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
              <Label htmlFor="item-planned">Planned Amount</Label>
              <Input
                id="item-planned"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={newItemPlanned}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) >= 0) {
                    setNewItemPlanned(value);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addNewBudgetItem}
              disabled={mutations.update.isPending}
            >
              {mutations.update.isPending ? "Adding..." : "Add Category"}
            </Button>
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
              disabled={mutations.update.isPending}
            >
              {mutations.update.isPending ? "Deleting..." : "Delete"}
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
              disabled={mutations.delete.isPending}
            >
              {mutations.delete.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetPage;
