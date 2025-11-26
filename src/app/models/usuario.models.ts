// src/app/models/usuario.models.ts

// Perfil cuando el rol es "administrador"
export interface AdminUserProfile {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

// Perfil cuando el rol es "alumno"
export interface AlumnoProfile {
    id: number;
    user: number;
    matricula: string;
    curp: string;
    rfc: string;
    fecha_nacimiento: string | null; //
    edad: number | null;
    telefono: string | null;
    ocupacion: string | null;
    creation: string | null;
    update: string | null;
}

// Perfil cuando el rol es "maestro"
export interface MaestroProfile {
    id: number;
    user: number;
    id_trabajador: string;
    fecha_nacimiento: string | null;
    telefono: string | null;
    rfc: string;
    cubiculo: string | null;
    edad: number | null;
    area_investigacion: string | null;
    materias_json: any;
    creation: string | null;
    update: string | null;
}

// Unión de todos los posibles perfiles
export type UserProfile = AdminUserProfile | AlumnoProfile | MaestroProfile | null;
