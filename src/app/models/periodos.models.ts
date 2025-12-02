// Posibles valores para el campo "estado" del periodo
export type PeriodoEstado = 'ACTIVO' | 'INACTIVO';

// Modelo tal cual lo devuelve el backend (PeriodoAcademicoSerializer)
export interface PeriodoAcademico {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: PeriodoEstado;
    creation: string | null;
    update: string | null;
}

// Body para crear un nuevo periodo (/periodo/ POST)
export interface PeriodoCreateRequest {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado?: PeriodoEstado;
}

// Respuesta de crear periodo (/periodo/ POST)
export interface PeriodoCreateResponse {
    periodo_created_id: number;
}

// Body para actualizar un periodo (/periodos-edit/ PUT)
export interface PeriodoUpdateRequest {
    id: number;
    nombre?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: PeriodoEstado;
}

// Respuesta de borrar periodo (/periodos-edit/ DELETE)
export interface PeriodoDeleteResponse {
    details: string;
}
