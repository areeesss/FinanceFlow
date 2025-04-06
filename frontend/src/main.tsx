import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext.tsx"; // Ensure FinanceProvider is applied at a higher level
import { ToastContextProvider } from "@/components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <FinanceProvider>
          <ToastContextProvider>
            <App />
          </ToastContextProvider>
        </FinanceProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
