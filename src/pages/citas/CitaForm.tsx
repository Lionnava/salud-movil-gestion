
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, Cita, Paciente, Medico, Usuario } from '../../db/database';
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

interface MedicoData extends Medico {
  nombreCompleto?: string;
}

const CitaForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<MedicoData[]>([]);
  const [cita, setCita] = useState<Partial<Cita>>({
    pacienteId: 0,
    medicoId: 0,
    fecha: new Date(),
    hora: '08:00',
    motivo: '',
    estado: 'programada',
    notas: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar pacientes
        const todosPacientes = await db.pacientes.toArray();
        setPacientes(todosPacientes);
        
        // Cargar médicos con nombres
        const todosMedicos = await db.medicos.toArray();
        const medicosConNombres = await Promise.all(
          todosMedicos.map(async (medico) => {
            const usuario = await db.usuarios.get(medico.usuarioId);
            return {
              ...medico,
              nombreCompleto: usuario ? `Dr. ${usuario.nombre} ${usuario.apellido}` : 'Médico desconocido'
            };
          })
        );
        setMedicos(medicosConNombres);
        
        // Si es edición, cargar la cita
        if (id !== 'nueva') {
          const citaExistente = await db.citas.get(Number(id));
          if (citaExistente) {
            // Convertir fecha a formato de entrada
            let fechaFormateada = citaExistente.fecha;
            if (fechaFormateada) {
              const fecha = new Date(fechaFormateada);
              citaExistente.fecha = fecha;
            }
            
            setCita(citaExistente);
          } else {
            setError('Cita no encontrada');
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCita(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCita(prev => ({
      ...prev,
      [name]: name === 'pacienteId' || name === 'medicoId' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Validaciones
      if (!cita.pacienteId || !cita.medicoId || !cita.fecha || !cita.hora || !cita.motivo) {
        setError('Todos los campos marcados con * son obligatorios');
        setSaving(false);
        return;
      }
      
      // Asegurarse de que la fecha es un objeto Date
      let datosProcesados = { 
        ...cita,
        fecha: cita.fecha instanceof Date 
          ? cita.fecha 
          : new Date(cita.fecha)
      };
      
      if (id !== 'nueva' && cita.id) {
        // Actualizar cita existente
        await db.citas.update(cita.id, datosProcesados);
      } else {
        // Crear nueva cita
        await db.citas.add(datosProcesados as Cita);
      }
      
      navigate('/citas');
    } catch (err) {
      console.error('Error al guardar la cita:', err);
      setError('Error al guardar los datos de la cita');
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
          onClick={() => navigate('/citas')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'nueva' ? 'Nueva Cita' : 'Editar Cita'}
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
                <Label htmlFor="pacienteId">Paciente *</Label>
                <Select 
                  value={cita.pacienteId?.toString() || ''} 
                  onValueChange={(value) => handleSelectChange('pacienteId', value)}
                >
                  <SelectTrigger id="pacienteId">
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map(paciente => (
                      <SelectItem key={paciente.id} value={paciente.id?.toString() || ''}>
                        {paciente.nombre} {paciente.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicoId">Médico *</Label>
                <Select 
                  value={cita.medicoId?.toString() || ''} 
                  onValueChange={(value) => handleSelectChange('medicoId', value)}
                >
                  <SelectTrigger id="medicoId">
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map(medico => (
                      <SelectItem key={medico.id} value={medico.id?.toString() || ''}>
                        {medico.nombreCompleto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={cita.fecha instanceof Date ? 
                    cita.fecha.toISOString().split('T')[0] : 
                    new Date(cita.fecha as Date).toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  name="hora"
                  type="time"
                  value={cita.hora}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="motivo">Motivo de la cita *</Label>
                <Input
                  id="motivo"
                  name="motivo"
                  value={cita.motivo}
                  onChange={handleChange}
                  placeholder="Motivo principal de la consulta"
                  required
                />
              </div>
              
              {id !== 'nueva' && (
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select 
                    value={cita.estado || 'programada'} 
                    onValueChange={(value) => handleSelectChange('estado', value)}
                  >
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notas">Notas adicionales</Label>
              <Textarea
                id="notas"
                name="notas"
                value={cita.notas || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones, síntomas, etc."
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/citas')}
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

export default CitaForm;
