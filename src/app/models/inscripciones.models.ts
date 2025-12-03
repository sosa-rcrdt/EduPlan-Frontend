import { Grupo } from './grupos.models';
import { Materia } from './materias.models';
import { Horario } from './horarios.models';
import { PeriodoAcademico } from './periodos.models';

export type InscripcionEstado = 'ACTIVA' | 'BAJA';

// Representa lo que devuelve InscripcionSerializer (__all__)
export interface Inscripcion {
    id: number;
    alumno: number;   // id de Alumnos
    grupo: number;    // id de Grupo
    periodo: number;  // id de PeriodoAcademico
    estado: InscripcionEstado;
    creation: string | null;
    update: string | null;
}

// Payload para crear inscripción (alumno opcional: el backend lo infiere si el rol es alumno)
export interface CrearInscripcionPayload {
    alumno?: number;
    grupo: number;
    periodo: number;
}

// Payload para actualizar inscripción (normalmente para cambiar estado o reasignar)
export interface ActualizarInscripcionPayload {
    id: number;
    alumno?: number;
    grupo?: number;
    periodo?: number;
    estado?: InscripcionEstado;
}

// Estructura que devuelve /inscripciones-alumno/
export interface CargaAcademicaItem {
    inscripcion: Inscripcion;
    grupo: Grupo;
    materia: Materia;
    periodo: PeriodoAcademico;
    horarios: Horario[];
}
