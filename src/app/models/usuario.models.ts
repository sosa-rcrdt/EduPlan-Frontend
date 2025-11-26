// Representa lo que devuelve UserSerializer (id, first_name, last_name, email)
export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

// Representa lo que devuelve AlumnoSerializer (registro de la tabla Alumnos)
export interface Alumno {
    id: number;
    user: User;
    matricula: string;
    curp: string;
    rfc: string;
    fecha_nacimiento: string | null;
    edad: number | null;
    telefono: string | null;
    ocupacion: string | null;
    creation: string | null;
    update: string | null;
}

// Representa lo que devuelve MaestroSerializer (registro de la tabla Maestros)
export interface Maestro {
    id: number;
    user: User;
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

// Representa lo que devuelve AdminSerializer (registro de la tabla Administradores)
export interface Administrador {
    id: number;
    user: User;
    clave_admin: string | null;
    telefono: string | null;
    rfc: string | null;
    edad: number | null;
    ocupacion: string | null;
    creation: string | null;
    update: string | null;
}

// Resumen de conteos para el dashboard (admins-edit GET)
export interface DashboardCounts {
    admins: number;
    maestros: number;
    alumnos: number;
}

// Unión de los posibles perfiles que llegan en /token/ (login) y que guardas como "perfil"
export type UserProfile = User | Alumno | Maestro | null;
