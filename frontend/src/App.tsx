import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Login from "./pages/login";
import Signup from "./pages/signup";
import GmailLogin from "./pages/gmail";
import ForgotPassword from "./pages/forgotpassword";
import VerifyCode from "./pages/verifycode";
import ResetPassword from "./pages/resetpass";
import Dashboard from "./pages/dashboard";
import AboutUs from "./pages/aboutus";
import Income from "./pages/income";
import Expenses from "./pages/expenses";
import FinanceGoal from "./pages/financegoal";
import Budgets from "./pages/budgets";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { FinanceProvider } from "./context/FinanceContext";

function App() {
  return (
    <FinanceProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gmail" element={<GmailLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/aboutus" element={<AboutUs />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/financegoal" element={<FinanceGoal />} />
          <Route path="/budgets" element={<Budgets />} />
        </Route>
      </Routes>
    </FinanceProvider>
  );
}

export default App;