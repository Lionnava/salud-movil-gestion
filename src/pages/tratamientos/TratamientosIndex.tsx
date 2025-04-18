
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, Tratamiento, Paciente, Medico } from '../../db/database';
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
import { ClipboardList, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TratamientosIndex: React.FC = () => {
  const [tratamientos, setTratamientos] = useState<Array<Tratamiento & { pacienteNombre?: string; medicoNombre?: string }>>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tratamientoEliminar, setTratamientoEliminar] = useState<Tratamiento | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const cargarTratamientos = async () => {
    // Obtener todos los tratamientos
    const todosTratamientos = await db.tratamientos.toArray();
    
    // Cargar información relacionada
    const tratamientosConInfo = await Promise.all(
      todosTratamientos.map(async (tratamiento) => {
        // Obtener datos del paciente
        const paciente = await db.pacientes.get(tratamiento.pacienteId);
        let pacienteNombre = 'Paciente desconocido';
        if (paciente) {
          pacienteNombre = `${paciente.nombre} ${paciente.apellido}`;
        }
        
        // Obtener datos del médico
        const medico = await db.medicos.get(tratamiento.medicoId);
        let medicoNombre = 'Médico desconocido';
        if (medico) {
          const usuario = await db.usuarios.get(medico.usuarioId);
          if (usuario) {
            medicoNombre = `Dr. ${usuario.nombre} ${usuario.apellido}`;
          }
        }
        
        return {
          ...tratamiento,
          pacienteNombre,
          medicoNombre
        };
      })
    );
    
    setTratamientos(tratamientosConInfo);
  };

  // Aplicar filtros y búsqueda
  const tratamientosFiltrados = tratamientos.filter(tratamiento => {
    const terminosBusqueda = busqueda.toLowerCase();
    return (
      (tratamiento.pacienteNombre?.toLowerCase().includes(terminosBusqueda) || false) ||
      (tratamiento.medicoNombre?.toLowerCase().includes(terminosBusqueda) || false) ||
      tratamiento.descripcion.toLowerCase().includes(terminosBusqueda)
    );
  });

  const confirmarEliminar = (tratamiento: Tratamiento) => {
    setTratamientoEliminar(tratamiento);
    setDialogoAbierto(true);
  };

  const eliminarTratamiento = async () => {
    if (tratamientoEliminar?.id) {
      await db.tratamientos.delete(tratamientoEliminar.id);
      await cargarTratamientos();
      setDialogoAbierto(false);
      setTratamientoEliminar(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Tratamientos
        </h1>
        <Link to="/tratamientos/nuevo">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo tratamiento
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por paciente, médico o descripción..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tratamientosFiltrados.length > 0 ? (
              tratamientosFiltrados.map((tratamiento) => (
                <TableRow key={tratamiento.id}>
                  <TableCell className="font-medium">{tratamiento.pacienteNombre}</TableCell>
                  <TableCell>{tratamiento.medicoNombre}</TableCell>
                  <TableCell>{format(new Date(tratamiento.fechaInicio), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {tratamiento.fechaFin 
                      ? format(new Date(tratamiento.fechaFin), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tratamiento.estado === 'activo' ? 'bg-green-100 text-green-800' :
                      tratamiento.estado === 'completado' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tratamiento.estado === 'activo' ? 'Activo' :
                       tratamiento.estado === 'completado' ? 'Completado' : 'Cancelado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/tratamientos/${tratamiento.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => confirmarEliminar(tratamiento)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {busqueda 
                    ? 'No se encontraron tratamientos con ese criterio de búsqueda'
                    : 'No hay tratamientos registrados'}
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
              ¿Estás seguro de que quieres eliminar este tratamiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarTratamiento}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TratamientosIndex;
