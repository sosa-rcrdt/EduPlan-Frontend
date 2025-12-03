import { PeriodoAcademico } from './periodos.models';
import { Grupo } from './grupos.models';
import { Horario } from './horarios.models';

// Item que devuelve /reporte-uso-aulas/
export interface ReporteUsoAulasItem {
    aula_id: number;
    aula: string;
    total_horas: number;
    num_horarios: number;
}

// Item que devuelve /reporte-carga-docente/
export interface ReporteCargaDocenteItem {
    docente_id: number;
    docente: string;
    total_horas: number;
    num_grupos: number;
}

// Respuesta de /reporte-grupo/
export interface ReporteGrupoResponse {
    grupo: Grupo;
    horarios: Horario[];
}

// Resumen general del periodo /reporte-periodo-resumen/
export interface ReportePeriodoResumen {
    periodo_id: number;
    periodo: string;
    total_horarios: number;
    total_grupos: number;
    total_aulas_usadas: number;
    total_docentes: number;
    total_horas: number;
}

// Resumen público /public/summary/
// Cuando no hay periodo activo, el backend devuelve {}.
export interface PublicSummaryResponse {
    periodo_activo?: PeriodoAcademico | null;
    total_grupos_con_horario?: number;
    total_aulas_usadas?: number;
    total_docentes_con_horario?: number;
    aulas_disponibles?: number;
}
