// Modelo tal cual lo devuelve MateriaSerializer
export interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    creditos: number;
    area_academica: string;
    creation: string | null;
    update: string | null;
}

// Body para crear una nueva materia (/materia/ POST)
export interface MateriaCreateRequest {
    nombre: string;
    codigo: string;
    creditos: number;
    area_academica: string;
}

// Respuesta de crear materia (/materia/ POST)
export interface MateriaCreateResponse {
    materia_created_id: number;
}

// Body para actualizar una materia (/materias-edit/ PUT)
export interface MateriaUpdateRequest {
    id: number;
    nombre?: string;
    codigo?: string;
    creditos?: number;
    area_academica?: string;
}

// Respuesta de borrar materia (/materias-edit/ DELETE)
export interface MateriaDeleteResponse {
    details: string;
}
