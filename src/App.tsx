import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProfilePage from "./pages/ProfilePage";
import SearchBooksPage from "./pages/SearchBooksPage";
import GenreBrowsePage from "./pages/GenreBrowsePage";
import ReturnBookPage from "./pages/ReturnBookPage";
import PaymentsPage from "./pages/PaymentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import BookAvailabilityPage from "./pages/BookAvailabilityPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import ManualReturnPage from "./pages/ManualReturnPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthGate />} />

            {/* Customer routes */}
            <Route path="/dashboard" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="search" element={<SearchBooksPage />} />
              <Route path="genres" element={<GenreBrowsePage />} />
              <Route path="return" element={<ReturnBookPage />} />
              <Route path="payments" element={<PaymentsPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="books" element={<BookAvailabilityPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="manual-return" element={<ManualReturnPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
