// Posibles estados de un aula
export type AulaEstado = 'DISPONIBLE' | 'NO_DISPONIBLE';

// Modelo tal cual lo devuelve AulaSerializer
export interface Aula {
    id: number;
    edificio: string;
    numero: string;
    capacidad: number;
    recursos: string | null;
    estado: AulaEstado;
    creation: string | null;
    update: string | null;
}

// Body para crear un aula (/aula/ POST)
export interface AulaCreateRequest {
    edificio: string;
    numero: string;
    capacidad: number;
    recursos?: string | null;
    estado?: AulaEstado;
}

// Respuesta de crear aula (/aula/ POST)
export interface AulaCreateResponse {
    aula_created_id: number;
}

// Body para actualizar un aula (/aulas-edit/ PUT)
export interface AulaUpdateRequest {
    id: number;
    edificio?: string;
    numero?: string;
    capacidad?: number;
    recursos?: string | null;
    estado?: AulaEstado;
}

// Respuesta de borrar aula (/aulas-edit/ DELETE)
export interface AulaDeleteResponse {
    details: string;
}
