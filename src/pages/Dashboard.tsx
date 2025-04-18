
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, Cita, Paciente, Medico, Medicamento } from '../db/database';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, User, Pill, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [citasHoy, setCitasHoy] = useState<(Cita & { pacienteNombre?: string; medicoNombre?: string })[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalPacientes: 0,
    totalMedicos: 0,
    totalMedicamentos: 0,
    citasPendientes: 0
  });

  useEffect(() => {
    const cargarDatos = async () => {
      // Obtener fecha de hoy (sin hora)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      // Cargar citas de hoy
      const citas = await db.citas
        .where('fecha')
        .equals(hoy)
        .toArray();
      
      // Cargar datos relacionados
      const citasConDatos = await Promise.all(citas.map(async (cita) => {
        const paciente = await db.pacientes.get(cita.pacienteId);
        const medicoUsuario = await db.medicos.get(cita.medicoId);
        let medicoNombre = '';
        
        if (medicoUsuario) {
          const usuario = await db.usuarios.get(medicoUsuario.usuarioId);
          if (usuario) {
            medicoNombre = `${usuario.nombre} ${usuario.apellido}`;
          }
        }
        
        return {
          ...cita,
          pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Desconocido',
          medicoNombre: medicoNombre || 'Desconocido'
        };
      }));
      
      setCitasHoy(citasConDatos);
      
      // Cargar estadísticas
      const totalPacientes = await db.pacientes.count();
      const totalMedicos = await db.medicos.count();
      const totalMedicamentos = await db.medicamentos.count();
      const citasPendientes = await db.citas
        .where('estado')
        .equals('programada')
        .count();
      
      setEstadisticas({
        totalPacientes,
        totalMedicos,
        totalMedicamentos,
        citasPendientes
      });
    };
    
    cargarDatos();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-gray-500">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pacientes</p>
              <h3 className="text-2xl font-bold">{estadisticas.totalPacientes}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Médicos</p>
              <h3 className="text-2xl font-bold">{estadisticas.totalMedicos}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Medicamentos</p>
              <h3 className="text-2xl font-bold">{estadisticas.totalMedicamentos}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Pill className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Citas Pendientes</p>
              <h3 className="text-2xl font-bold">{estadisticas.citasPendientes}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Citas de hoy */}
      <Card className="mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Citas para hoy</CardTitle>
          <Link to="/citas/nueva">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="h-4 w-4" /> Nueva cita
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {citasHoy.length > 0 ? (
            <div className="space-y-4">
              {citasHoy.map((cita) => (
                <div key={cita.id} className="flex items-center p-3 rounded-md border">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{cita.pacienteNombre}</h4>
                    <p className="text-sm text-gray-500">Dr. {cita.medicoNombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{cita.hora}</p>
                    <p className="text-sm text-gray-500">{cita.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No hay citas programadas para hoy</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Acciones rápidas */}
      <h2 className="text-lg font-semibold mb-3">Acciones rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/pacientes/nuevo">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium">Nuevo paciente</h3>
              <p className="text-sm text-gray-500 mt-1">Registrar un nuevo paciente</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/citas/nueva">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full mb-3">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-medium">Nueva cita</h3>
              <p className="text-sm text-gray-500 mt-1">Programar una nueva cita</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/medicamentos/nuevo">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <Pill className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-medium">Nuevo medicamento</h3>
              <p className="text-sm text-gray-500 mt-1">Registrar un nuevo medicamento</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
