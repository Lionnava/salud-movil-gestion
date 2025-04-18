
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, Paciente } from '../../db/database';
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
import { Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PacientesIndex: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [pacienteEliminar, setPacienteEliminar] = useState<Paciente | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const todos = await db.pacientes.toArray();
    setPacientes(todos);
  };

  const pacientesFiltrados = pacientes.filter(paciente => 
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    paciente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    paciente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    paciente.numeroIdentificacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarEliminar = (paciente: Paciente) => {
    setPacienteEliminar(paciente);
    setDialogoAbierto(true);
  };

  const eliminarPaciente = async () => {
    if (pacienteEliminar?.id) {
      await db.pacientes.delete(pacienteEliminar.id);
      await cargarPacientes();
      setDialogoAbierto(false);
      setPacienteEliminar(null);
    }
  };

  const calcularEdad = (fechaNacimiento: Date): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Pacientes
        </h1>
        <Link to="/pacientes/nuevo">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo paciente
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, apellido, email o identificación..."
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
              <TableHead>Nombre</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">
                    {paciente.nombre} {paciente.apellido}
                  </TableCell>
                  <TableCell>{paciente.numeroIdentificacion}</TableCell>
                  <TableCell>{calcularEdad(paciente.fechaNacimiento)} años</TableCell>
                  <TableCell>{paciente.telefono}</TableCell>
                  <TableCell>{paciente.email}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/pacientes/${paciente.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => confirmarEliminar(paciente)}
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
                    ? 'No se encontraron pacientes con ese criterio de búsqueda'
                    : 'No hay pacientes registrados'}
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
              ¿Estás seguro de que quieres eliminar al paciente <span className="font-semibold">{pacienteEliminar?.nombre} {pacienteEliminar?.apellido}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarPaciente}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PacientesIndex;
