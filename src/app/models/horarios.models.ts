// Posibles estados del horario
export type HorarioEstado = 'ACTIVO' | 'CANCELADO';

// Días de la semana según el backend (0=Lunes, 1=Martes, ...)
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5;

// Modelo tal cual lo devuelve HorarioSerializer
export interface Horario {
    id: number;
    periodo: number;
    grupo: number;
    aula: number;
    dia_semana: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    docente: number;
    estado: HorarioEstado;
    creation: string | null;
    update: string | null;
}

// Body para crear un horario (/horarios/ POST)
export interface HorarioCreateRequest {
    periodo: number;
    grupo: number;
    aula: number;
    dia_semana: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    docente: number;
    estado?: HorarioEstado;
}

// Respuesta de crear horario (/horarios/ POST)
export interface HorarioCreateResponse {
    horario_created_id: number;
}

// Body para actualizar un horario (/horario/ PUT)
export interface HorarioUpdateRequest {
    id: number;
    periodo?: number;
    grupo?: number;
    aula?: number;
    dia_semana?: DiaSemana;
    hora_inicio?: string;
    hora_fin?: string;
    docente?: number;
    estado?: HorarioEstado;
}

// Respuesta de borrar horario (/horario/ DELETE)
export interface HorarioDeleteResponse {
    details: string;
}