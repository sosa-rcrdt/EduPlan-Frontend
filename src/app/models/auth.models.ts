import { UserProfile } from './usuario.models';

// Rol que regresa el backend en /token/
export type UserRole = 'alumno' | 'maestro' | 'administrador' | '' | null;

// Body que mandamos al backend para hacer login (/token/)
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  rol: UserRole;
  perfil: UserProfile;
}

// Body para refrescar el token (/token/refresh/)
export interface RefreshTokenRequest {
  refresh: string;
}

// Respuesta de /token/refresh/
export interface RefreshTokenResponse {
  access: string;
}

// Respuesta de /logout/
export interface LogoutResponse {
  logout: boolean;
}

// Body para cambiar la contraseña (/change-password/)
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Respuesta de /change-password/
export interface ChangePasswordResponse {
  details: string; // ej. "Contraseña actualizada correctamente"
}
