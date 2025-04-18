
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, Cita, Paciente, Medico } from '../../db/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CitasIndex: React.FC = () => {
  const [citas, setCitas] = useState<Array<Cita & { pacienteNombre?: string; medicoNombre?: string }>>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [citaEliminar, setCitaEliminar] = useState<Cita | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    // Obtener todas las citas
    const todasCitas = await db.citas.toArray();
    
    // Cargar información relacionada
    const citasConInfo = await Promise.all(
      todasCitas.map(async (cita) => {
        // Obtener datos del paciente
        const paciente = await db.pacientes.get(cita.pacienteId);
        let pacienteNombre = 'Paciente desconocido';
        if (paciente) {
          pacienteNombre = `${paciente.nombre} ${paciente.apellido}`;
        }
        
        // Obtener datos del médico (a través de la tabla 'medicos' y 'usuarios')
        const medico = await db.medicos.get(cita.medicoId);
        let medicoNombre = 'Médico desconocido';
        if (medico) {
          const usuario = await db.usuarios.get(medico.usuarioId);
          if (usuario) {
            medicoNombre = `Dr. ${usuario.nombre} ${usuario.apellido}`;
          }
        }
        
        return {
          ...cita,
          pacienteNombre,
          medicoNombre
        };
      })
    );
    
    setCitas(citasConInfo);
  };

  // Aplicar filtros y búsqueda
  const citasFiltradas = citas.filter(cita => {
    // Filtrar por estado
    if (filtroEstado !== 'todas' && cita.estado !== filtroEstado) {
      return false;
    }
    
    // Filtrar por búsqueda
    const terminosBusqueda = busqueda.toLowerCase();
    return (
      (cita.pacienteNombre?.toLowerCase().includes(terminosBusqueda) || false) ||
      (cita.medicoNombre?.toLowerCase().includes(terminosBusqueda) || false) ||
      cita.motivo.toLowerCase().includes(terminosBusqueda)
    );
  });

  const confirmarEliminar = (cita: Cita) => {
    setCitaEliminar(cita);
    setDialogoAbierto(true);
  };

  const eliminarCita = async () => {
    if (citaEliminar?.id) {
      await db.citas.delete(citaEliminar.id);
      await cargarCitas();
      setDialogoAbierto(false);
      setCitaEliminar(null);
    }
  };

  const formatearFecha = (fecha: Date): string => {
    return format(new Date(fecha), 'EEEE, d MMMM yyyy', { locale: es });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Citas Médicas
        </h1>
        <Link to="/citas/nueva">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> Nueva cita
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por paciente, médico o motivo..."
              className="pl-10"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las citas</SelectItem>
                <SelectItem value="programada">Programadas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citasFiltradas.length > 0 ? (
              citasFiltradas.map((cita) => (
                <TableRow key={cita.id}>
                  <TableCell>{formatearFecha(cita.fecha)}</TableCell>
                  <TableCell>{cita.hora}</TableCell>
                  <TableCell className="font-medium">{cita.pacienteNombre}</TableCell>
                  <TableCell>{cita.medicoNombre}</TableCell>
                  <TableCell>{cita.motivo}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cita.estado === 'programada' ? 'bg-blue-100 text-blue-800' :
                      cita.estado === 'completada' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cita.estado === 'programada' ? 'Programada' :
                       cita.estado === 'completada' ? 'Completada' : 'Cancelada'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/citas/${cita.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => confirmarEliminar(cita)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {busqueda || filtroEstado !== 'todas'
                    ? 'No se encontraron citas con esos criterios de búsqueda'
                    : 'No hay citas registradas'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarCita}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitasIndex;
