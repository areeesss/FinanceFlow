import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import userimg from "@/assets/imgs/user.webp";
import { Switch } from "@/components/ui/switch";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
// Import our custom hooks
import { useIncome, useExpenses, useGoals } from "@/hooks";

// Define types for the data structure
interface ChartData {
  day: string;
  income: number;
  expenses: number;
}

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

const Dashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Initialize user data from auth context
  const [fullName, setFullName] = useState<string>(user?.full_name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [username, setUsername] = useState<string>(user?.username || "");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  // Use our custom hooks instead of direct TanStack Query
  const { 
    income: incomeData, 
    isLoading: incomeLoading, 
    error: incomeError,
    totalIncome
  } = useIncome();

  const {
    expenses: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
    totalExpenses
  } = useExpenses();

  const {
    goals: goalsData,
    isLoading: goalsLoading,
    error: goalsError
  } = useGoals();

  // Loading state from all hooks
  const loading = incomeLoading || expensesLoading || goalsLoading;
  
  // Combined error from all hooks
  const error = incomeError || expensesError || goalsError;
    
  const netIncome = totalIncome - totalExpenses;

  // Update chart data when income or expenses change
  useEffect(() => {
    if (Array.isArray(incomeData) && Array.isArray(expensesData)) {
      console.log("Updating chart data with:", { income: incomeData, expenses: expensesData });
      
      // Group income and expenses by month
      const monthlyData = new Map<string, { income: number; expenses: number }>();
      
      // Process income
      incomeData.forEach(item => {
        if (!item.date) return; // Skip items without dates
        
        try {
          const date = new Date(item.date);
          const month = date.toLocaleString('default', { month: 'short' });
          const current = monthlyData.get(month) || { income: 0, expenses: 0 };
          monthlyData.set(month, { 
            ...current, 
            income: current.income + item.amount
          });
        } catch (e) {
          console.error("Error processing income item for chart:", item, e);
        }
      });

      // Process expenses
      expensesData.forEach(item => {
        if (!item.date) return; // Skip items without dates
        
        try {
          const date = new Date(item.date);
          const month = date.toLocaleString('default', { month: 'short' });
          const current = monthlyData.get(month) || { income: 0, expenses: 0 };
          monthlyData.set(month, { 
            ...current, 
            expenses: current.expenses + item.amount
          });
        } catch (e) {
          console.error("Error processing expense item for chart:", item, e);
        }
      });

      // Convert to array format for chart, sorted by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartDataArray = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          day: month,
          income: data.income,
          expenses: data.expenses
        }))
        .sort((a, b) => months.indexOf(a.day) - months.indexOf(b.day));

      console.log("Generated chart data:", chartDataArray);
      setChartData(chartDataArray);
    }
  }, [incomeData, expensesData]);

  // Get recent transactions with more reliable handling
  const recentTransactions = useMemo(() => {
    try {
      if (!Array.isArray(incomeData) || !Array.isArray(expensesData)) {
        return [];
      }
      
      // Combine income and expenses with proper type labeling
      const allTransactions = [
        ...incomeData.map(item => ({
          id: item.id,
          name: item.source,
          amount: item.amount,
          date: item.date || '',
          transactionType: 'income',
          color: item.color
        })),
        ...expensesData.map(item => ({
          id: item.id,
          name: item.type,
          amount: item.amount,
          date: item.date || '',
          transactionType: 'expense',
          color: item.color
        }))
      ];
      
      // Sort by date, most recent first
      const sortedTransactions = allTransactions.sort((a, b) => {
        const dateA = new Date(a.date || '').getTime();
        const dateB = new Date(b.date || '').getTime();
        return dateB - dateA; // Descending order
      });
      
      // Take the 5 most recent transactions
      return sortedTransactions.slice(0, 5);
    } catch (error) {
      console.error("Error processing recent transactions:", error);
      return [];
    }
  }, [incomeData, expensesData]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Check for mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Additional useEffect for error logging
  useEffect(() => {
    if (error) {
      console.error("Error in dashboard component:", error);
    }
  }, [error]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
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
              active={true}
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/income">
            <NavItem icon={Wallet} label="Income" isSidebarOpen={true} />
          </Link>
          <Link to="/expenses">
            <NavItem icon={CreditCard} label="Expenses" isSidebarOpen={true} />
          </Link>
          <Link to="/financegoal">
            <NavItem icon={Goal} label="Goals" isSidebarOpen={true} />
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
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu size={24} />
              </Button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">
                Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/aboutus">
                <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                  About Us
                </button>
              </Link>
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
                  <Popover
                    open={openPopover}
                    onOpenChange={setOpenPopover}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
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
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-3 sm:p-4 pb-2 rounded-lg border bg-gray-100">
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
        <main className="flex-1 p-6 overflow-y-auto">
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
                  onClick={handleLogout}
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Total Income</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalIncome)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Total Expenses</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Net Income</p>
                  <h3 className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </h3>
                </div>
                <div className={`p-3 ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full`}>
                  <PiggyBank className={`w-6 h-6 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>
          </div>

          {/* Income vs Expenses Chart */}
          <Card className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white shadow-md rounded-xl w-full overflow-hidden">
            <CardContent className="h-full">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                Income vs Expenses
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-4">
                Track your income and expenses over time with this interactive chart.
              </p>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                      data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIncome"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorExpenses"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace('.00', '')} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `${label}`}
                      />
                    <Area
                      type="monotone"
                      dataKey="income"
                        name="Income"
                      stroke="#3b82f6"
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                        name="Expenses"
                      stroke="#ef4444"
                      fill="url(#colorExpenses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 mb-2">No transaction data available yet</p>
                    <div className="flex gap-3">
                      <Link to="/income">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          Add Income
                        </Button>
                      </Link>
                      <Link to="/expenses">
                        <Button className="bg-red-500 hover:bg-red-600 text-white">
                          Add Expenses
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: transaction.color }}
                          />
                          {transaction.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.date
                          ? formatDate(new Date(transaction.date))
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        className={
                          transaction.transactionType === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {goalsData && goalsData.length > 0 ? (
                <div className="space-y-4">
                  {goalsData.map((goal) => {
                    // Calculate percentage progress
                    const progressPercent = Math.min(
                      100,
                      ((goal.amountSaved / goal.targetAmount) * 100) || 0
                    );
                    
                    return (
                      <div
                        key={goal.id}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {goal.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(goal.amountSaved)} / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No financial goals set</p>
                  <Link to="/financegoal">
                    <Button className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white">
                      Create a Goal
                    </Button>
                  </Link>
                </div>
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

export default Dashboard;