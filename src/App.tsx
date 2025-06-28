import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import AppSidebar from "./components/AppSidebar";
import Dashboard from "./components/Dashboard";
import Brides from "./components/Brides";
import Calendar from "./components/Calendar";
import Login from "./components/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ReportsPage from './components/forms';
import WeddingsStatsPage from './components/data';
import BrideProfile from "./components/brideProfile";
import PublicMeasurementForm from "./components/PublicMeasurementForm";
import EmployeeHoursPage from './components/EmployeeHoursPage';
import UserAreaComponent from './components/UserArea'; // 👈 Import the component

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 w-full flex">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-amber-200 bg-white">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/brides" element={<Brides />} />
              <Route path="/brides/:id" element={<BrideProfile />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/forms" element={<ReportsPage />} />
              <Route path="/data" element={<WeddingsStatsPage />} />
              <Route path="/employee-hours" element={<EmployeeHoursPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </SidebarInset>

        {/* 👇 User drawer avatar visible on all protected pages */}
        <UserAreaComponent />
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* 🔓 Public form – accessible without login */}
              <Route path="/measurements/:brideId/form" element={<PublicMeasurementForm />} />
              <Route path="/login" element={<Login />} />
              {/* 🔐 Protected routes */}
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
