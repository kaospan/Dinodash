import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import { supabase, type DbLevel } from "@/lib/supabaseClient";
import Index from "./pages/Index";
import Crm from "./pages/Crm";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { Dinodash3D } from "./components/Dinodash3D";
import { CameraModeToggle } from "./components/CameraModeToggle";

const queryClient = new QueryClient();

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args);
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, fontFamily: 'monospace' }}><h1>Dinodash failed to start</h1><p>{this.state.error?.message || 'Unknown error'}</p><button onClick={() => window.location.reload()}>Reload</button></div>;
    }
    return this.props.children;
  }
}

devLog('App.tsx loading...');

const App = () => {
  const [dbLevels, setDbLevels] = useState<DbLevel[]>([]);
  useEffect(() => {
    async function getLevels() {
      if (!supabase) return;
      const { data: levels } = await supabase.from('levels').select();
      if (levels) setDbLevels(levels as DbLevel[]);
    }
    getLevels();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/3d" element={<Dinodash3D />} />
              <Route path="/mapper" element={<Index />} />
              <Route path="/crm" element={<Crm />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CameraModeToggle />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;