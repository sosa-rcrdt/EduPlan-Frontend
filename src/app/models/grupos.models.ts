// Modelo tal cual lo devuelve GrupoSerializer
export interface Grupo {
    id: number;
    nombre: string;
    semestre: number;
    materia: number;
    cupo_maximo: number;
    creation: string | null;
    update: string | null;
}

// Body para crear grupo (/grupo/ POST)
export interface GrupoCreateRequest {
    nombre: string;
    semestre: number;
    materia: number;
    cupo_maximo: number;
}

// Respuesta de crear grupo (/grupo/ POST)
export interface GrupoCreateResponse {
    grupo_created_id: number;
}

// Body para actualizar grupo (/grupos-edit/ PUT)
export interface GrupoUpdateRequest {
    id: number;
    nombre?: string;
    semestre?: number;
    materia?: number;
    cupo_maximo?: number;
}

// Respuesta de eliminar grupo (/grupos-edit/ DELETE)
export interface GrupoDeleteResponse {
    details: string;
}
