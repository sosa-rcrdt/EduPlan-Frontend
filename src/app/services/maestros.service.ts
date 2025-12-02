import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Maestro } from '../models/usuario.models';

@Injectable({
  providedIn: 'root',
})
export class MaestrosService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtiene la lista completa de maestros activos.
  getMaestros(): Observable<Maestro[]> {
    const url = `${this.apiUrl}/lista-maestros/`;
    const headers = this.getAuthHeaders();

    return this.http.get<Maestro[]>(url, { headers });
  }

  // Obtiene un maestro por su id.
  getMaestroById(id: number): Observable<Maestro> {
    const url = `${this.apiUrl}/maestros/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Maestro>(url, { headers, params });
  }

  // Crea un nuevo maestro + usuario.
  crearMaestro(payload: any): Observable<{ maestro_created_id: number }> {
    const url = `${this.apiUrl}/maestros/`;
    const headers = this.getAuthHeaders();

    return this.http.post<{ maestro_created_id: number }>(url, payload, { headers });
  }

  // Actualiza un maestro existente.
  actualizarMaestro(payload: any): Observable<Maestro> {
    const url = `${this.apiUrl}/maestros-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Maestro>(url, payload, { headers });
  }

  // Elimina un maestro por id.
  eliminarMaestro(id: number): Observable<{ details: string }> {
    const url = `${this.apiUrl}/maestros-edit/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.delete<{ details: string }>(url, { headers, params });
  }

  // Construye los headers con Authorization: Bearer <token>.
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
