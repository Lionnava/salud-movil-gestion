
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Pill, 
  User, 
  Users, 
  Calendar, 
  ClipboardList,
  FileText,
  LogOut, 
  ChevronDown,
  Settings
} from 'lucide-react';

const Layout: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="bg-white text-primary rounded-full p-1">
              <Pill size={20} />
            </span>
            Salud Móvil
          </Link>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <User className="h-5 w-5" />
                    {currentUser.nombre} {currentUser.apellido}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  {currentUser.rol === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Administración
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r shadow-sm p-4">
          <nav className="space-y-1">
            <Link to="/" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <Home size={18} />
              <span>Inicio</span>
            </Link>
            <Link to="/medicamentos" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <Pill size={18} />
              <span>Medicamentos</span>
            </Link>
            <Link to="/medicos" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <User size={18} />
              <span>Médicos</span>
            </Link>
            <Link to="/pacientes" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <Users size={18} />
              <span>Pacientes</span>
            </Link>
            <Link to="/citas" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <Calendar size={18} />
              <span>Citas</span>
            </Link>
            <Link to="/tratamientos" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <ClipboardList size={18} />
              <span>Tratamientos</span>
            </Link>
            
            <Link to="/reportes" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
              <FileText size={18} />
              <span>Reportes</span>
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-4 text-center text-sm">
        © 2025 Salud Móvil. Todos los derechos reservados. 
        Desarrollado por Ing. Lionell Nava
      </footer>
    </div>
  );
};

export default Layout;
