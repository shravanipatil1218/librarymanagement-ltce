import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-card px-2">
            <SidebarTrigger className="ml-1" />
            <span className="ml-3 text-sm font-display font-semibold text-foreground">LibraHub Admin</span>
          </header>
          <main className="flex-1 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
