import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Wallet,
  Goal,
  List,
  CreditCard,
  Menu,
  Users,
  Target,
  Eye,
  Settings,
  Save,
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import userimg from "@/assets/imgs/user.webp";
import { Separator } from "@/components/ui/separator";
import halfbg from "@/assets/imgs/halfbg.webp";
import art from "@/assets/imgs/heart.webp";
import vin from "@/assets/imgs/vin.webp";
import gil from "@/assets/imgs/jil.webp";
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
import { LucideIcon } from "lucide-react";

// Define TypeScript interface for NavItem props
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  isSidebarOpen: boolean;
}

const AboutUs = () => {
  const NavItem = ({
    icon: Icon,
    label,
    active = false,
    isSidebarOpen,
  }: NavItemProps) => (
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

  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const navigate = useNavigate();

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
              isSidebarOpen={true} // Always show labels in sidebar
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
              active={false}
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
        <main className="flex-1 p-0 overflow-y-auto">
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

          <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section
              className="relative h-[400px] bg-cover bg-center text-white"
              style={{ backgroundImage: `url(${halfbg})` }}
            >
              <div className="absolute inset-0 bg-black/50" />{" "}
              {/* Adds a dark overlay */}
              <div className="container mx-auto px-4 py-20 relative">
                <div className="max-w-3xl mx-auto text-center fade-in">
                  <h1 className="text-base md:text-5xl font-bold mb-6">
                    Welcome to FinanceFlow!
                  </h1>
                  <p className="text-base md:text-xl opacity-90 text-justify">
                    At FinanceFlow, we believe that managing your personal
                    finances should be straightforward, empowering, and
                    accessible to everyone. Our mission is to help individuals
                    take control of their financial lives through a
                    comprehensive and user-friendly finance tracking tool that
                    simplifies budgeting, saving, and investing.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto slide-up">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="h-6 w-6 text-primary" />
                    <h2 className="text-base md:text-3xl font-bold">
                      Our Story
                    </h2>
                  </div>
                  <p className="text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    FinanceFlow was born out of a simple yet powerful idea: to
                    help individuals and businesses gain control over their
                    finances with ease. We realized that many people struggle
                    with budgeting, tracking expenses, and making informed
                    financial decisions.
                  </p>
                  <p className="mt-4 text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    Our journey began with a passion for financial literacy and
                    technology. We assembled a team of experts in finance and
                    software development to create an intuitive platform that
                    simplifies financial management for everyone.
                  </p>
                  <p className="mt-4 text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    Since our launch, we've been committed to continuous
                    innovation. We listen to our users, adapt to their needs,
                    and refine our platform to provide the best possible
                    experience. Our story is just beginning, and we're excited
                    to be part of your financial journey.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-10 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto slide-up">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="h-6 w-6 text-primary" />
                    <h2 className="text-base md:text-3xl font-bold">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    At FinanceFlow, our mission is to empower you to take charge
                    of your finances. We strive to provide you with the tools
                    and resources you need to make informed financial decisions,
                    set achievable goals, and ultimately achieve financial
                    freedom.
                  </p>
                  <p className="mt-4 text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    We believe that everyone deserves the opportunity to build a
                    secure financial future. That's why we are committed to
                    delivering a user-friendly, educational, and intuitive
                    platform that simplifies personal finance management.
                  </p>
                  <p className="mt-4 text-gray-700 text-base md-text-lg leading-relaxed text-justify">
                    Our goal is not just to track your finances but to educate
                    and guide you toward smarter money habits, better
                    investments, and long-term financial stability. We are here
                    to support you every step of the way.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Vision Section */}
            <section className="py-10 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto slide-up">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="h-6 w-6 text-primary" />
                    <h2 className="text-base md:text-3xl font-bold">
                      Our Vision
                    </h2>
                  </div>
                  <p className="text-gray-600 text-base md-text-lg leading-relaxed text-justify">
                    We prioritize simplicity by offering a user-friendly design
                    and straightforward features that make finance tracking
                    accessible to everyone. Transparency is at the core of our
                    approach, ensuring clear communication and honest practices
                    so users fully understand how our platform works. Our
                    mission is to empower individuals with the knowledge and
                    tools they need to take control of their financial future.
                    Additionally, we foster a strong sense of community,
                    providing a supportive space where users can share
                    experiences, tips, and encouragement.
                  </p>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section className="py-20  bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto slide-up">
                  <h2 className="text-base md:text-3xl font-bold text-center mb-4">
                    Meet Our Team
                  </h2>
                  <p className="text-gray-600 text-base md-text-lg leading-relaxed text-justify mb-10">
                    Our dedicated team of finance enthusiasts, developers, and
                    customer support specialists is passionate about helping you
                    succeed. We are committed to continuously improving our
                    platform based on user feedback and the latest financial
                    trends.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {/* Team Member Cards */}
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <img
                      src={gil}
                      alt="Team Member"
                      className="w-full h-60 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-base md:text-xl text-center font-semibold mb-2">
                      Gil John Rey Naldoza
                    </h3>
                    <p className="text-base md:text-xl text-center text-indigo-500">
                      UI/UX Designer
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <img
                      src={vin}
                      alt="Team Member"
                      className="w-full h-60 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-base md:text-xl text-center font-semibold mb-2">
                      Vin Marcus Gerebise
                    </h3>
                    <p className="text-base md:text-xl text-center text-indigo-500">
                      Backend and Frontend Logic Programmer
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <img
                      src={art}
                      alt="Team Member"
                      className="w-full h-60 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-base md:text-xl  text-center font-semibold mb-2">
                      Heart Chiong
                    </h3>
                    <p className="text-base md:text-xl  text-center text-indigo-500">
                      Frontend Logic and Frontend Design Programmer
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-blue-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-bold text-base md:text-lg mb-4">
                      FinanceFlow
                    </h3>
                    <p className="text-white">Keep Your Finances</p>
                    <p>Flowing Smoothly</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg mb-4">
                      Quick Links
                    </h3>
                    <ul className="space-y-2 text-white">
                      <li>Dashboard</li>
                      <li>About Us</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg mb-4">
                      Contact Us
                    </h3>
                    <p className="text-white">info@FinanceFlow.com</p>
                    <p className="text-white">(+63) 9363 6327 333</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg mb-4">
                      Follow Us
                    </h3>
                    <p className="text-white">Instagram</p>
                    <p className="text-white">Facebook</p>
                  </div>
                </div>
                <Separator className="my-8 bg-gray-800" />
                <p className="text-center text-gray-400 text-base md:text-sm">
                  © {new Date().getFullYear()} Financial Expert. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </div>
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

export default AboutUs;
