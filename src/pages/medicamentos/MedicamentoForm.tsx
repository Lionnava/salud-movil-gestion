
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, Medicamento } from '../../db/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, Save } from 'lucide-react';

const MedicamentoForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [medicamento, setMedicamento] = useState<Partial<Medicamento>>({
    nombre: '',
    descripcion: '',
    principioActivo: '',
    presentacion: '',
    dosis: '',
    stock: 0,
    fechaVencimiento: undefined,
  });

  useEffect(() => {
    const cargarMedicamento = async () => {
      if (id === 'nuevo') return;
      
      setLoading(true);
      try {
        const medicamentoExistente = await db.medicamentos.get(Number(id));
        if (medicamentoExistente) {
          // Convertir fechaVencimiento a formato de entrada
          let fechaFormateada = medicamentoExistente.fechaVencimiento;
          if (fechaFormateada) {
            const fecha = new Date(fechaFormateada);
            fechaFormateada = fecha.toISOString().split('T')[0];
          }
          
          setMedicamento({
            ...medicamentoExistente,
            fechaVencimiento: fechaFormateada,
          });
        } else {
          setError('Medicamento no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar el medicamento:', err);
        setError('Error al cargar los datos del medicamento');
      } finally {
        setLoading(false);
      }
    };
    
    cargarMedicamento();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let valorProcesado: string | number | Date | undefined = value;
    
    if (type === 'number') {
      valorProcesado = parseInt(value) || 0;
    }
    
    setMedicamento(prev => ({
      ...prev,
      [name]: valorProcesado
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      if (!medicamento.nombre || !medicamento.principioActivo) {
        setError('El nombre y el principio activo son obligatorios');
        setSaving(false);
        return;
      }
      
      // Convertir fechaVencimiento a objeto Date si existe
      let datosProcesados = { ...medicamento };
      if (typeof datosProcesados.fechaVencimiento === 'string' && datosProcesados.fechaVencimiento) {
        datosProcesados.fechaVencimiento = new Date(datosProcesados.fechaVencimiento);
      }
      
      if (id !== 'nuevo' && medicamento.id) {
        // Actualizar medicamento existente
        await db.medicamentos.update(medicamento.id, datosProcesados);
      } else {
        // Crear nuevo medicamento
        await db.medicamentos.add(datosProcesados as Medicamento);
      }
      
      navigate('/medicamentos');
    } catch (err) {
      console.error('Error al guardar el medicamento:', err);
      setError('Error al guardar los datos del medicamento');
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
          onClick={() => navigate('/medicamentos')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'nuevo' ? 'Nuevo Medicamento' : 'Editar Medicamento'}
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
                  value={medicamento.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre comercial del medicamento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="principioActivo">Principio Activo *</Label>
                <Input
                  id="principioActivo"
                  name="principioActivo"
                  value={medicamento.principioActivo}
                  onChange={handleChange}
                  required
                  placeholder="Componente activo principal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="presentacion">Presentación</Label>
                <Input
                  id="presentacion"
                  name="presentacion"
                  value={medicamento.presentacion}
                  onChange={handleChange}
                  placeholder="Tabletas, cápsulas, jarabe, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosis">Dosis recomendada</Label>
                <Input
                  id="dosis"
                  name="dosis"
                  value={medicamento.dosis}
                  onChange={handleChange}
                  placeholder="Dosis típica"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={medicamento.stock}
                  onChange={handleChange}
                  placeholder="Cantidad disponible"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  name="fechaVencimiento"
                  type="date"
                  value={medicamento.fechaVencimiento instanceof Date 
                    ? medicamento.fechaVencimiento.toISOString().split('T')[0] 
                    : medicamento.fechaVencimiento as unknown as string}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={medicamento.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción detallada del medicamento"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/medicamentos')}
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

export default MedicamentoForm;
