
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pill } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    rol: 'medico'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRolChange = (value: string) => {
    setFormData(prev => ({ ...prev, rol: value as 'admin' | 'medico' | 'enfermero' | 'recepcionista' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.email || !formData.password || !formData.nombre || !formData.apellido) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        rol: formData.rol as 'admin' | 'medico' | 'enfermero' | 'recepcionista'
      });

      if (success) {
        navigate('/login', { state: { registered: true } });
      } else {
        setError('Este email ya está en uso');
      }
    } catch (err) {
      setError('Ocurrió un error al registrar el usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="inline-block rounded-full bg-white p-3 mb-3">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Salud Móvil</h1>
          <p className="text-primary-foreground/80 mt-1">Sistema de Gestión Médica</p>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Crear cuenta</h2>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select 
                value={formData.rol} 
                onValueChange={handleRolChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medico">Médico</SelectItem>
                  <SelectItem value="enfermero">Enfermero</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        © 2025 Salud Móvil. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default Register;
