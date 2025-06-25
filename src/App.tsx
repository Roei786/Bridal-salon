
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


const queryClient = new QueryClient();

// A wrapper component to protect routes that require authentication
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// The main app content that uses authentication
const AppContent = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return (
      <>
        <Toaster />
        <Sonner />
        <Login />
      </>
    );
  }

  return (
    <BrowserRouter>
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
                <Route path="/calendar" element={<Calendar />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/forms" element={<ReportsPage />} />
                <Route path="/data" element={<WeddingsStatsPage />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
};

// Main App component with all providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
