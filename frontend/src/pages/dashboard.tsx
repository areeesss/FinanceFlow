import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  Home,
  Wallet,
  Goal,
  List,
  CreditCard,
  Menu,
  Settings,
  Save,
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

// Sample data for Income vs Expenses chart
const data = [
  { day: "Mon", income: 3000, expenses: 2000 },
  { day: "Tue", income: 2500, expenses: 2200 },
  { day: "Wed", income: 7000, expenses: 5000 },
  { day: "Thur", income: 4000, expenses: 3500 },
  { day: "Fri", income: 4500, expenses: 4000 },
  { day: "Sat", income: 5000, expenses: 4500 },
];

const NavItem = ({ icon: Icon, label, active = false, isSidebarOpen }: { icon: any; label: string; active?: boolean; isSidebarOpen: boolean }) => (
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

const StatCard = ({ title, amount }: { title: string; amount: string }) => (
  <Card className="p-4 bg-white shadow-lg rounded-2xl">
    <CardContent className="text-center">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-2xl font-bold text-black">{amount}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

const handleLogout = () => {
  // Clear authentication token or state
  localStorage.removeItem("authToken"); // Example for clearing token
  // Redirect to login page
  window.location.href = "/login"; // Adjust the path as necessary
};


  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
  isSidebarOpen={true} // Always show labels in sidebar
/>

          </Link>
          <Link to="/income">
            <NavItem icon={Wallet} label="Income" active={false} isSidebarOpen={true} />
          </Link>
          <Link to="/expenses">
            <NavItem icon={CreditCard} label="Expenses" active={false} isSidebarOpen={true} />
          </Link>
          <Link to="/financegoal">
            <NavItem icon={Goal} label="Goals" active={false} isSidebarOpen={true} />
          </Link>
          <Link to="/budgets">
            <NavItem icon={List} label="Budgets" active={false} isSidebarOpen={true} />
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
                Overview
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
                      side="right"
                      align="start"
                      className="w-80 p-4 bg-white shadow-lg rounded-md"
                    >
                      {/* ✅ Section: Personal Information */}
                      <h2 className="text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-4 rounded-lg border bg-gray-100">
                        {/* ✅ Toggle between Settings and Save button */}
                        <button
                          className="absolute bottom-3 right-2 text-gray-600 hover:text-gray-800"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? (
                            <Save className="w-5 h-5" />
                          ) : (
                            <Settings className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex items-center space-x-3">
                          <Avatar className="h-16 w-16">
                            <img
                              src={userimg}
                              alt="User"
                              className="h-full w-full object-cover rounded-full"
                            />
                          </Avatar>

                          <div className="w-full">
                            {isEditing ? ( // ✅ If in edit mode, show input fields
                              <>
                                <input
                                  type="text"
                                  className="w-40 px-2 py-1 border rounded-md"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                />
                                <input
                                  type="email"
                                  className="w-40 mt-2 px-2 py-1 border rounded-md"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="w-40 mt-2 px-2 py-1 border rounded-md"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                />
                              </>
                            ) : (
                              // ✅ Otherwise, display text
                              <>
                                <p className="text-lg font-bold">{fullName}</p>
                                <p className="text-sm text-gray-600">{email}</p>
                                <p className="text-sm text-gray-600">
                                  Username: {username}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ✅ Section: Notification Settings */}
                      <div className="mt-4 p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-semibold">
                            Notification Settings
                          </h3>
                          <p className="text-sm text-gray-600">
                            Manage how you receive alerts and notifications
                          </p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>

                      {/* ✅ Section: Email Notifications */}
                      <div className="mt-2 p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-semibold">
                            Email Notifications
                          </h3>
                          <p className="text-sm text-gray-600">
                            Receive weekly summaries and important alerts
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
          <div className="text-base sm:text-lg md:text-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <StatCard title="Total Income" amount="₱100.00" />
            <StatCard title="Total Expenses" amount="₱100.00" />
          </div>

          {/* Income vs Expenses Chart */}
          <Card className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white shadow-md rounded-xl w-full overflow-hidden">
            <CardContent className="h-full">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                Income vs Expenses
              </h2>
              <p className="ttext-base sm:text-lg md:text-xl text-gray-500 mb-4">
                Track your income and expenses over time with this interactive
                chart.
              </p>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
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

                    {/* Add grid here */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#3b82f6"
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      fill="url(#colorExpenses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
