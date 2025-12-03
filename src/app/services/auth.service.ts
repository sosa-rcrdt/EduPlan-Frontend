import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginRequest, LoginResponse, RefreshTokenResponse, LogoutResponse, UserRole } from '../models/auth.models';
import { UserProfile } from '../models/usuario.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.url_api;

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_ROLE_KEY = 'user_role';
  private readonly USER_PROFILE_KEY = 'user_profile';

  constructor(private http: HttpClient) {}

  // Realiza el login contra /token/ y guarda la sesión en localStorage.
  login(payload: LoginRequest): Observable<LoginResponse> {
    const url = `${this.apiUrl}/token/`;

    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  // Usa el refresh token guardado para obtener un nuevo access token
  refreshToken(): Observable<RefreshTokenResponse> {
    const refresh = this.getRefreshToken();
    const url = `${this.apiUrl}/token/refresh/`;

    return this.http.post<RefreshTokenResponse>(url, { refresh }).pipe(
      tap((response) => {
        this.saveAccessToken(response.access);
      })
    );
  }

  // Llama al backend en /logout/ y limpia la sesión en el frontend.
  logout(): Observable<LogoutResponse> {
    const url = `${this.apiUrl}/logout/`;
    const headers = this.getAuthHeaders();

    // Limpiamos primero en el front
    this.clearSession();

    return this.http.get<LogoutResponse>(url, { headers });
  }

  // Devuelve el access token actual (o null si no hay).
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Devuelve el refresh token actual (o null si no hay).
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Devuelve el rol del usuario logueado (alumno, maestro, administrador),
  getCurrentRole(): UserRole {
    const rol = localStorage.getItem(this.USER_ROLE_KEY);
    return (rol as UserRole) || null;
  }

  // Devuelve el perfil del usuario logueado (admin, alumno o maestro)
  getCurrentProfile(): UserProfile {
    const raw = localStorage.getItem(this.USER_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserProfile;
    } catch (e) {
      return null;
    }
  }

  // Indica si hay sesión iniciada a nivel frontend.
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  private saveSession(response: LoginResponse): void {
    this.saveAccessToken(response.access);
    this.saveRefreshToken(response.refresh);

    const rol = response.rol || '';
    localStorage.setItem(this.USER_ROLE_KEY, rol);

    if (response.perfil != null) {
      localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(response.perfil));
    } else {
      localStorage.removeItem(this.USER_PROFILE_KEY);
    }
  }

  private saveAccessToken(access: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
  }

  private saveRefreshToken(refresh: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
  }

  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.USER_PROFILE_KEY);
  }

  // Reusamos la misma lógica de headers que en ProfileService
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();

    const headersConfig: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }
}
