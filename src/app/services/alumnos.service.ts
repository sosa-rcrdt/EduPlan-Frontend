import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Alumno } from '../models/usuario.models';

@Injectable({
  providedIn: 'root',
})
export class AlumnosService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtiene la lista completa de alumnos activos.
  getAlumnos(): Observable<Alumno[]> {
    const url = `${this.apiUrl}/lista-alumnos/`;
    const headers = this.getAuthHeaders();

    return this.http.get<Alumno[]>(url, { headers });
  }

  // Obtiene un alumno por su id.
  getAlumnoById(id: number): Observable<Alumno> {
    const url = `${this.apiUrl}/alumnos/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Alumno>(url, { headers, params });
  }

  // Crea un nuevo alumno + usuario.
  crearAlumno(payload: any): Observable<{ alumno_created_id: number }> {
    const url = `${this.apiUrl}/alumnos/`;
    const headers = this.getAuthHeaders();

    return this.http.post<{ alumno_created_id: number }>(url, payload, { headers });
  }

  // Actualiza un alumno existente.
  actualizarAlumno(payload: any): Observable<{ alumno_updated_id: number }> {
    const url = `${this.apiUrl}/alumnos-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<{ alumno_updated_id: number }>(url, payload, { headers });
  }

  // Elimina un alumno por id.
  eliminarAlumno(id: number): Observable<{ details: string }> {
    const url = `${this.apiUrl}/alumnos-edit/`;
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
