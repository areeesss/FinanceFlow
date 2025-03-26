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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState("monthly");
  const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [deleteBudgetAlertOpen, setDeleteBudgetAlertOpen] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(1);
  const [activeChartView] = useState("bar"); // "bar" or "pie"

  // State for new budget form
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetPeriod, setNewBudgetPeriod] = useState("monthly");

  // State for new budget item form
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemPlanned, setNewItemPlanned] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Sample data for budgets
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: 1,
      name: "March 2025 Budget",
      period: "monthly",
      totalPlanned: 13400,
      totalActual: 4965,
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      items: [
        {
          id: 1,
          category: "Rent",
          planned: 1200,
          actual: 1200,
          remaining: 0,
          progress: 100,
        },
        {
          id: 2,
          category: "Groceries",
          planned: 5000,
          actual: 450,
          remaining: 4550,
          progress: 64,
        },
        {
          id: 3,
          category: "Transportation",
          planned: 2000,
          actual: 115,
          remaining: 1885,
          progress: 50,
        },
        {
          id: 4,
          category: "Allowance",
          planned: 2000,
          actual: 0,
          remaining: 1000,
          progress: 90,
        },
        {
          id: 5,
          category: "Savings",
          planned: 3200,
          actual: 3200,
          remaining: 0,
          progress: 85,
        },
      ],
    },
    {
      id: 2,
      name: "Week 1 Groceries",
      period: "weekly",
      totalPlanned: 500,
      totalActual: 450,
      startDate: "2025-03-10",
      endDate: "2025-03-16",
      items: [
        {
          id: 1,
          category: "House Groceries",
          planned: 300,
          actual: 225,
          remaining: 750,
          progress: 60,
        },
        {
          id: 2,
          category: "Apartment Groceries",
          planned: 300,
          actual: 225,
          remaining: 750,
          progress: 45,
        },
      ],
    },
    {
      id: 3,
      name: "March 1 Budget",
      period: "daily",
      totalPlanned: 200,
      totalActual: 190,
      startDate: "2025-03-12",
      endDate: "2025-03-12",
      items: [
        {
          id: 1,
          category: "Food",
          planned: 100,
          actual: 75,
          remaining: 25,
          progress: 100,
        },
        {
          id: 2,
          category: "Transportation",
          planned: 100,
          actual: 115,
          remaining: 5,
          progress: 100,
        },
      ],
    },
  ]);

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

  const addNewBudget = () => {
    if (!newBudgetName || !newBudgetPeriod) return;
    const newId =
      budgets.length > 0 ? Math.max(...budgets.map((b) => b.id)) + 1 : 1;
    const newBudget: Budget = {
      id: newId,
      name: newBudgetName,
      period: newBudgetPeriod as "daily" | "weekly" | "monthly",
      items: [],
      totalPlanned: 0,
      totalActual: 0,
      startDate: new Date().toISOString().split("T")[0],
    };
    setBudgets([...budgets, newBudget]);
    setNewBudgetName("");
    setNewBudgetPeriod("monthly");
    setNewBudgetDialogOpen(false);
    setCurrentBudgetId(newId);
    setActivePeriod(newBudgetPeriod);
  };

  const addNewBudgetItem = () => {
    if (!newItemCategory || !newItemPlanned || !editingBudgetId) return;
    const updatedBudgets = budgets.map((budget) => {
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
        return {
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual,
        };
      }
      return budget;
    });
    setBudgets(updatedBudgets);
    setNewItemCategory("");
    setNewItemPlanned("");
    setNewItemDialogOpen(false);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete || !editingBudgetId) return;
    const updatedBudgets = budgets.map((budget) => {
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
        return {
          ...budget,
          items: updatedItems,
          totalPlanned,
          totalActual,
        };
      }
      return budget;
    });
    setBudgets(updatedBudgets);
    setItemToDelete(null);
    setDeleteAlertOpen(false);
  };

  const handleDeleteBudget = () => {
    if (!budgetToDelete) return;
    const updatedBudgets = budgets.filter(
      (budget) => budget.id !== budgetToDelete
    );
    setBudgets(updatedBudgets);
    if (updatedBudgets.length > 0) {
      // If we're deleting the current budget, switch to the first available one
      if (currentBudgetId === budgetToDelete) {
        setCurrentBudgetId(updatedBudgets[0].id);
        setActivePeriod(updatedBudgets[0].period);
      }
    }
    setBudgetToDelete(null);
    setDeleteBudgetAlertOpen(false);
  };

  // Filter budgets by period type
  const filteredBudgets = budgets.filter(
    (budget) => budget.period === activePeriod
  );

  // Get current budget
  const currentBudget =
    budgets.find((budget) => budget.id === currentBudgetId) ||
    filteredBudgets[0];

  // Function to update budget category spending
  const updateActualSpending = (
    budgetId: number,
    itemId: number,
    amount: string
  ) => {
    const updatedBudgets = budgets.map((budget) => {
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
        return {
          ...budget,
          items: updatedItems,
          totalActual,
        };
      }
      return budget;
    });
    setBudgets(updatedBudgets);
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
  const currentStatus = currentBudget
    ? getBudgetStatus(currentBudget)
    : { status: "N/A", color: "gray" };

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

  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const currencySymbol = "₱"; // Change to your preferred currency

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
              defaultValue="monthly"
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
                onClick={() => setNewBudgetDialogOpen(true)}
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
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  No {activePeriod} budgets found. Create a new budget to get
                  started.
                </p>
              </CardContent>
            </Card>
          )}
    
          {/* Current Budget Overview */}
          {currentBudget && (
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
          )}
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
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Add a new budget to track your spending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetName" className="text-right">
                Name
              </Label>
              <Input
                id="budgetName"
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., March 2025 Budget"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetPeriod" className="text-right">
                Period
              </Label>
              <Select
                value={newBudgetPeriod}
                onValueChange={(value) => setNewBudgetPeriod(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewBudgetDialogOpen(false)}
            >
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
              Add a new category to your budget.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Category
              </Label>
              <Input
                id="categoryName"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Groceries"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plannedAmount" className="text-right">
                Planned Amount
              </Label>
              <Input
                id="plannedAmount"
                type="number"
                value={newItemPlanned}
                onChange={(e) => setNewItemPlanned(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
            >
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
