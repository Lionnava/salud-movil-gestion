
import React from 'react';
import { FileText, Download, Printer, FileSpreadsheet, FileLineChart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportesIndex = () => {
  const reportes = [
    {
      id: 'pacientes',
      titulo: 'Reporte de Pacientes',
      descripcion: 'Lista completa de pacientes con sus datos principales',
      icon: FileText
    },
    {
      id: 'medicamentos',
      titulo: 'Inventario de Medicamentos',
      descripcion: 'Estado actual del inventario y medicamentos próximos a vencer',
      icon: FileSpreadsheet
    },
    {
      id: 'citas',
      titulo: 'Reporte de Citas',
      descripcion: 'Historial de citas médicas y estadísticas',
      icon: FileLineChart
    }
  ];

  const handleExportar = (reporteId: string, formato: string) => {
    console.log(`Exportando reporte ${reporteId} en formato ${formato}`);
    // Aquí implementaremos la lógica de exportación
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportes.map((reporte) => (
          <Card key={reporte.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <reporte.icon className="h-5 w-5" />
                {reporte.titulo}
              </CardTitle>
              <CardDescription>{reporte.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Select onValueChange={(formato) => handleExportar(reporte.id, formato)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="w-[48%]">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" className="w-[48%]">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportesIndex;
