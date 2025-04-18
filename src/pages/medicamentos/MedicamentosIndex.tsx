
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, Medicamento } from '../../db/database';
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
import { Pill, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const MedicamentosIndex: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [medicamentoEliminar, setMedicamentoEliminar] = useState<Medicamento | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    const todos = await db.medicamentos.toArray();
    setMedicamentos(todos);
  };

  const medicamentosFiltrados = medicamentos.filter(med => 
    med.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    med.principioActivo.toLowerCase().includes(busqueda.toLowerCase()) ||
    med.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarEliminar = (medicamento: Medicamento) => {
    setMedicamentoEliminar(medicamento);
    setDialogoAbierto(true);
  };

  const eliminarMedicamento = async () => {
    if (medicamentoEliminar?.id) {
      await db.medicamentos.delete(medicamentoEliminar.id);
      await cargarMedicamentos();
      setDialogoAbierto(false);
      setMedicamentoEliminar(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Pill className="h-6 w-6" />
          Medicamentos
        </h1>
        <Link to="/medicamentos/nuevo">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo medicamento
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, principio activo o descripción..."
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
              <TableHead>Principio Activo</TableHead>
              <TableHead>Presentación</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicamentosFiltrados.length > 0 ? (
              medicamentosFiltrados.map((medicamento) => (
                <TableRow key={medicamento.id}>
                  <TableCell className="font-medium">{medicamento.nombre}</TableCell>
                  <TableCell>{medicamento.principioActivo}</TableCell>
                  <TableCell>{medicamento.presentacion}</TableCell>
                  <TableCell>
                    <span className={medicamento.stock < 10 ? 'text-red-500 font-medium' : ''}>
                      {medicamento.stock} unidades
                    </span>
                  </TableCell>
                  <TableCell>
                    {medicamento.fechaVencimiento 
                      ? format(new Date(medicamento.fechaVencimiento), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/medicamentos/${medicamento.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => confirmarEliminar(medicamento)}
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
                    ? 'No se encontraron medicamentos con ese criterio de búsqueda'
                    : 'No hay medicamentos registrados'}
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
              ¿Estás seguro de que quieres eliminar el medicamento <span className="font-semibold">{medicamentoEliminar?.nombre}</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarMedicamento}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicamentosIndex;
