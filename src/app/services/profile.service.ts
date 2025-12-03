import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { UserProfile } from '../models/usuario.models';
import { ChangePasswordRequest, ChangePasswordResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtiene el perfil del usuario logueado (admin, alumno o maestro)
  getProfile(): Observable<any> {
    const url = `${this.apiUrl}/profile/me/`;
    const headers = this.getAuthHeaders();

    return this.http.get<any>(url, { headers });
  }

  // Actualiza el perfil del usuario logueado a través de /profile/me/.
  updateProfile(payload: any): Observable<any> {
    const url = `${this.apiUrl}/profile/me/`;
    const headers = this.getAuthHeaders();

    return this.http.put<any>(url, payload, { headers });
  }

  // Cambia la contraseña del usuario logueado a través de /change-password/.
  changePassword(payload: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    const url = `${this.apiUrl}/change-password/`;
    const headers = this.getAuthHeaders();

    return this.http.put<ChangePasswordResponse>(url, payload, { headers });
  }

  // Construye los headers con Authorization: Bearer <token> tomando el access token del AuthService.
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();

    const headersConfig: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }
}
