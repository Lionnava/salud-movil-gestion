
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, Paciente } from '../../db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, Save } from 'lucide-react';

const PacienteForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [paciente, setPaciente] = useState<Partial<Paciente>>({
    nombre: '',
    apellido: '',
    fechaNacimiento: new Date(),
    genero: '',
    direccion: '',
    telefono: '',
    email: '',
    numeroIdentificacion: '',
    grupoSanguineo: '',
    alergias: '',
  });

  useEffect(() => {
    const cargarPaciente = async () => {
      if (id === 'nuevo') return;
      
      setLoading(true);
      try {
        const pacienteExistente = await db.pacientes.get(Number(id));
        if (pacienteExistente) {
          // Convertir fechaNacimiento a formato de entrada
          let fechaFormateada = pacienteExistente.fechaNacimiento;
          if (fechaFormateada) {
            const fecha = new Date(fechaFormateada);
            pacienteExistente.fechaNacimiento = fecha;
          }
          
          setPaciente(pacienteExistente);
        } else {
          setError('Paciente no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar el paciente:', err);
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };
    
    cargarPaciente();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaciente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPaciente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Validaciones
      if (!paciente.nombre || !paciente.apellido || !paciente.numeroIdentificacion) {
        setError('El nombre, apellido e identificación son obligatorios');
        setSaving(false);
        return;
      }
      
      if (!paciente.fechaNacimiento) {
        setError('La fecha de nacimiento es obligatoria');
        setSaving(false);
        return;
      }
      
      // Asegurarse de que la fecha es un objeto Date
      let datosProcesados = { 
        ...paciente,
        fechaNacimiento: paciente.fechaNacimiento instanceof Date 
          ? paciente.fechaNacimiento 
          : new Date(paciente.fechaNacimiento)
      };
      
      if (id !== 'nuevo' && paciente.id) {
        // Actualizar paciente existente
        await db.pacientes.update(paciente.id, datosProcesados);
      } else {
        // Crear nuevo paciente
        await db.pacientes.add(datosProcesados as Paciente);
      }
      
      navigate('/pacientes');
    } catch (err) {
      console.error('Error al guardar el paciente:', err);
      setError('Error al guardar los datos del paciente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/pacientes')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'nuevo' ? 'Nuevo Paciente' : 'Editar Paciente'}
        </h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={paciente.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre del paciente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={paciente.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Apellido del paciente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numeroIdentificacion">Número de Identificación *</Label>
                <Input
                  id="numeroIdentificacion"
                  name="numeroIdentificacion"
                  value={paciente.numeroIdentificacion}
                  onChange={handleChange}
                  required
                  placeholder="DNI, Cédula, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={paciente.fechaNacimiento instanceof Date ? 
                    paciente.fechaNacimiento.toISOString().split('T')[0] : 
                    new Date(paciente.fechaNacimiento as Date).toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select 
                  value={paciente.genero} 
                  onValueChange={(value) => handleSelectChange('genero', value)}
                >
                  <SelectTrigger id="genero">
                    <SelectValue placeholder="Selecciona el género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                    <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grupoSanguineo">Grupo Sanguíneo</Label>
                <Select 
                  value={paciente.grupoSanguineo || ''} 
                  onValueChange={(value) => handleSelectChange('grupoSanguineo', value)}
                >
                  <SelectTrigger id="grupoSanguineo">
                    <SelectValue placeholder="Selecciona el grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={paciente.telefono}
                  onChange={handleChange}
                  placeholder="Número de contacto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={paciente.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                value={paciente.direccion}
                onChange={handleChange}
                placeholder="Dirección completa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                name="alergias"
                value={paciente.alergias || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Alergias conocidas"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/pacientes')}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacienteForm;
