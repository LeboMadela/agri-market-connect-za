import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import { useSession } from "@/hooks/useSession";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Wrapper to protect routes except "/auth"
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!session && location.pathname !== "/auth") {
      navigate("/auth", { replace: true });
    }
    if (session && location.pathname === "/auth") {
      navigate("/", { replace: true });
    }
  }, [session, location.pathname, navigate]);

  // Prevent flicker
  if (!session && location.pathname !== "/auth") {
    return null;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
