import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, seedDatabase } from "./db/database";
import { useEffect } from "react";

// Layouts
import Layout from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// App Pages
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ReportesIndex from "./pages/reportes/ReportesIndex";

// Medicamentos
import MedicamentosIndex from "./pages/medicamentos/MedicamentosIndex";
import MedicamentoForm from "./pages/medicamentos/MedicamentoForm";

// Pacientes
import PacientesIndex from "./pages/pacientes/PacientesIndex";
import PacienteForm from "./pages/pacientes/PacienteForm";

// Citas
import CitasIndex from "./pages/citas/CitasIndex";
import CitaForm from "./pages/citas/CitaForm";

// Tratamientos
import TratamientosIndex from "./pages/tratamientos/TratamientosIndex";

// Ruta protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Inicializar base de datos
const DatabaseInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const init = async () => {
      await seedDatabase();
    };
    
    init();
  }, []);
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Medicamentos */}
        <Route path="medicamentos">
          <Route index element={<MedicamentosIndex />} />
          <Route path=":id" element={<MedicamentoForm />} />
        </Route>
        
        {/* Pacientes */}
        <Route path="pacientes">
          <Route index element={<PacientesIndex />} />
          <Route path=":id" element={<PacienteForm />} />
        </Route>
        
        {/* Citas */}
        <Route path="citas">
          <Route index element={<CitasIndex />} />
          <Route path=":id" element={<CitaForm />} />
        </Route>
        
        {/* Tratamientos */}
        <Route path="tratamientos">
          <Route index element={<TratamientosIndex />} />
        </Route>

        {/* Reportes */}
        <Route path="reportes" element={<ReportesIndex />} />
      </Route>
      
      {/* Ruta para 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DatabaseInitializer>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </DatabaseInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
