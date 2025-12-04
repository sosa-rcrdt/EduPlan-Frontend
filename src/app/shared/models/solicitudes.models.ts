// Estados posibles de la solicitud en el backend
export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

// Modelo tal como lo devuelve SolicitudCambioSerializer
export interface SolicitudCambio {
    id: number;
    docente: number;
    grupo: number;
    dia_semana_original: number;
    dia_semana_propuesto: number | null;
    hora_inicio_propuesta: string | null;
    hora_fin_propuesta: string | null;

    motivo: string;
    estado: EstadoSolicitud;
    fecha_creacion: string;
    fecha_resolucion: string | null;
    creation: string | null;
    update: string | null;
}

// Body para crear solicitud (/solicitud/ POST)
// El docente se toma del usuario autenticado en el backend.
export interface SolicitudCreateRequest {
    grupo: number;
    dia_semana_original: number;
    dia_semana_propuesto: number;
    hora_inicio_propuesta: string;
    hora_fin_propuesta: string;
    motivo: string;
}

// Respuesta de crear solicitud (/solicitud/ POST)
export interface SolicitudCreateResponse {
    solicitud_created_id: number;
}

// Body para actualizar solicitud (/solicitudes-edit/ PUT)
export interface SolicitudUpdateRequest {
    id: number;
    docente?: number;
    grupo?: number;

    dia_semana_propuesto?: number;
    hora_inicio_propuesta?: string;
    hora_fin_propuesta?: string;

    motivo?: string;
    estado?: EstadoSolicitud;
}

// Respuesta de eliminar solicitud (/solicitudes-edit/ DELETE)
export interface SolicitudDeleteResponse {
    details: string;
}
