
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pill, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Por favor ingrese su email');
      setLoading(false);
      return;
    }

    try {
      const result = await forgotPassword(email);
      if (result) {
        setSuccess(true);
      } else {
        setError('No encontramos una cuenta con ese email');
      }
    } catch (err) {
      setError('Ocurrió un error al procesar la solicitud');
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
          <h2 className="text-xl font-semibold mb-2 text-center">Recuperar contraseña</h2>
          <p className="text-center text-gray-600 mb-6">
            Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña.
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Se han enviado las instrucciones de recuperación a tu email. Por favor revisa tu bandeja de entrada.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        © 2025 Salud Móvil. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default ForgotPassword;
