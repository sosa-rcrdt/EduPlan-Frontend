import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Administrador, DashboardCounts } from '../models/usuario.models';

@Injectable({
  providedIn: 'root',
})
export class AdministradoresService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtiene la lista completa de administradores activos.
  getAdministradores(): Observable<Administrador[]> {
    const url = `${this.apiUrl}/lista-admins/`;
    const headers = this.getAuthHeaders();

    return this.http.get<Administrador[]>(url, { headers });
  }

  // Obtiene un administrador por su id.
  getAdministradorById(id: number): Observable<Administrador> {
    const url = `${this.apiUrl}/admin/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Administrador>(url, { headers, params });
  }

  // Crea un nuevo administrador + usuario.
  crearAdministrador(payload: any): Observable<{ admin_created_id: number }> {
    const url = `${this.apiUrl}/admin/`;
    const headers = this.getAuthHeaders();

    return this.http.post<{ admin_created_id: number }>(url, payload, { headers });
  }

  // Obtiene los conteos de admins, maestros y alumnos.
  getDashboardCounts(): Observable<DashboardCounts> {
    const url = `${this.apiUrl}/admins-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.get<DashboardCounts>(url, { headers });
  }

  // Edita un administrador existente.
  actualizarAdministrador(payload: any): Observable<Administrador> {
    const url = `${this.apiUrl}/admins-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Administrador>(url, payload, { headers });
  }

  // Elimina un administrador por id.
  eliminarAdministrador(id: number): Observable<{ details: string }> {
    const url = `${this.apiUrl}/admins-edit/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.delete<{ details: string }>(url, { headers, params });
  }

  // Construye los headers con Authorization: Bearer <token> usando AuthService.
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
