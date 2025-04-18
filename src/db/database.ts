
import Dexie, { Table } from 'dexie';

// Definimos las interfaces para nuestros modelos
export interface Usuario {
  id?: number;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'medico' | 'enfermero' | 'recepcionista';
  activo: boolean;
}

export interface Medicamento {
  id?: number;
  nombre: string;
  descripcion: string;
  principioActivo: string;
  presentacion: string;
  dosis: string;
  stock: number;
  fechaVencimiento?: Date | string;
}

export interface Medico {
  id?: number;
  usuarioId: number;
  especialidad: string;
  licencia: string;
  telefono: string;
}

export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  genero: string;
  direccion: string;
  telefono: string;
  email: string;
  numeroIdentificacion: string;
  grupoSanguineo?: string;
  alergias?: string;
}

export interface Cita {
  id?: number;
  pacienteId: number;
  medicoId: number;
  fecha: Date;
  hora: string;
  motivo: string;
  estado: 'programada' | 'completada' | 'cancelada';
  notas?: string;
}

export interface Tratamiento {
  id?: number;
  pacienteId: number;
  medicoId: number;
  fechaInicio: Date;
  fechaFin?: Date;
  descripcion: string;
  estado: 'activo' | 'completado' | 'cancelado';
}

export interface Prescripcion {
  id?: number;
  tratamientoId: number;
  medicamentoId: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones: string;
}

// Creamos nuestra base de datos extendiendo Dexie
class HealthcareDB extends Dexie {
  // Declaramos las tablas
  usuarios!: Table<Usuario>;
  medicamentos!: Table<Medicamento>;
  medicos!: Table<Medico>;
  pacientes!: Table<Paciente>;
  citas!: Table<Cita>;
  tratamientos!: Table<Tratamiento>;
  prescripciones!: Table<Prescripcion>;

  constructor() {
    super('HealthcareDB');
    
    // Definimos los esquemas para cada tabla
    this.version(1).stores({
      usuarios: '++id, email, rol',
      medicamentos: '++id, nombre, principioActivo',
      medicos: '++id, usuarioId, especialidad',
      pacientes: '++id, nombre, apellido, email, numeroIdentificacion',
      citas: '++id, pacienteId, medicoId, fecha, estado',
      tratamientos: '++id, pacienteId, medicoId, fechaInicio, estado',
      prescripciones: '++id, tratamientoId, medicamentoId'
    });
  }
}

// Instancia de la base de datos
export const db = new HealthcareDB();

// Función para crear datos de prueba iniciales
export async function seedDatabase() {
  const usuariosCount = await db.usuarios.count();
  
  if (usuariosCount === 0) {
    // Crear usuario administrador
    const adminId = await db.usuarios.add({
      email: 'admin@clinica.com',
      password: 'admin123', // En producción usar hash
      nombre: 'Administrador',
      apellido: 'Sistema',
      rol: 'admin',
      activo: true
    });
    
    // Crear médico de prueba
    const medicoId = await db.usuarios.add({
      email: 'doctor@clinica.com',
      password: 'doctor123', // En producción usar hash
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'medico',
      activo: true
    });
    
    // Asociar médico a su perfil profesional
    await db.medicos.add({
      usuarioId: medicoId as number,
      especialidad: 'Medicina General',
      licencia: 'MG-12345',
      telefono: '555-123-4567'
    });
    
    // Crear paciente de prueba
    await db.pacientes.add({
      nombre: 'María',
      apellido: 'González',
      fechaNacimiento: new Date('1985-05-15'),
      genero: 'Femenino',
      direccion: 'Av. Principal 123',
      telefono: '555-987-6543',
      email: 'maria@ejemplo.com',
      numeroIdentificacion: '12345678',
      grupoSanguineo: 'O+',
      alergias: 'Penicilina'
    });
    
    // Crear medicamento de prueba
    await db.medicamentos.add({
      nombre: 'Paracetamol',
      descripcion: 'Analgésico y antipirético',
      principioActivo: 'Paracetamol',
      presentacion: 'Tabletas 500mg',
      dosis: '1-2 tabletas cada 8 horas',
      stock: 100,
      fechaVencimiento: new Date('2025-12-31')
    });
    
    console.log('Base de datos inicializada con datos de prueba');
  }
}
