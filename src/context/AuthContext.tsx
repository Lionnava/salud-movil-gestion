
import React, { createContext, useState, useContext, useEffect } from 'react';
import { db, Usuario } from '../db/database';

interface AuthContextType {
  currentUser: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<Usuario, 'id' | 'activo'>) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const checkSession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as Usuario;
          // Verificar que el usuario aún existe en la base de datos
          const user = await db.usuarios.get(userData.id as number);
          if (user && user.activo) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            // Usuario no existe o está inactivo, cerrar sesión
            localStorage.removeItem('currentUser');
          }
        } catch (error) {
          console.error('Error al verificar la sesión:', error);
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // En una aplicación real, la contraseña debería estar hasheada
      const user = await db.usuarios
        .where('email')
        .equals(email.toLowerCase())
        .first();
      
      if (user && user.password === password && user.activo) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Guardar sesión
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<Usuario, 'id' | 'activo'>): Promise<boolean> => {
    try {
      // Verificar si el email ya está en uso
      const existingUser = await db.usuarios
        .where('email')
        .equals(userData.email.toLowerCase())
        .first();
      
      if (existingUser) {
        return false;
      }
      
      // En una aplicación real, la contraseña debería estar hasheada
      const newUser: Usuario = {
        ...userData,
        email: userData.email.toLowerCase(),
        activo: true
      };
      
      await db.usuarios.add(newUser);
      return true;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const user = await db.usuarios
        .where('email')
        .equals(email.toLowerCase())
        .first();
      
      if (user) {
        // Aquí enviaríamos un correo electrónico con instrucciones
        // para recuperar la contraseña.
        // En una aplicación real, generaríamos un token y enviaríamos un enlace.
        console.log(`Solicitud de recuperación de contraseña para: ${email}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    forgotPassword,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};
