import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

import {
  Inscripcion,
  CrearInscripcionPayload,
  ActualizarInscripcionPayload,
  CargaAcademicaItem,
} from '../shared/models/inscripciones.models';

@Injectable({
  providedIn: 'root',
})
export class InscripcionesService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Obtiene la lista de inscripciones con filtros opcionales
  getInscripciones(filters?: {
    alumno_id?: number;
    grupo_id?: number;
    periodo_id?: number;
    estado?: string;
  }): Observable<Inscripcion[]> {
    const url = `${this.apiUrl}/inscripciones/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();
    if (filters) {
      if (filters.alumno_id != null) {
        params = params.set('alumno_id', String(filters.alumno_id));
      }
      if (filters.grupo_id != null) {
        params = params.set('grupo_id', String(filters.grupo_id));
      }
      if (filters.periodo_id != null) {
        params = params.set('periodo_id', String(filters.periodo_id));
      }
      if (filters.estado) {
        params = params.set('estado', filters.estado);
      }
    }

    return this.http.get<Inscripcion[]>(url, { headers, params });
  }

  // Obtiene una inscripción por id.
  getInscripcionById(id: number): Observable<Inscripcion> {
    const url = `${this.apiUrl}/inscripcion/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.get<Inscripcion>(url, { headers, params });
  }

  // Crea una nueva inscripción.
  crearInscripcion(payload: CrearInscripcionPayload): Observable<Inscripcion> {
    const url = `${this.apiUrl}/inscripcion/`;
    const headers = this.getAuthHeaders();

    return this.http.post<Inscripcion>(url, payload, { headers });
  }

  // Actualiza una inscripción existente (tipicamente el estado: ACTIVA / BAJA).
  actualizarInscripcion(
    payload: ActualizarInscripcionPayload
  ): Observable<Inscripcion> {
    const url = `${this.apiUrl}/inscripciones-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Inscripcion>(url, payload, { headers });
  }

  // Elimina una inscripción por id (baja definitiva).
  eliminarInscripcion(id: number): Observable<{ details: string }> {
    const url = `${this.apiUrl}/inscripciones-edit/`;
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('id', id.toString());

    return this.http.delete<{ details: string }>(url, { headers, params });
  }

  // Obtiene la carga académica del alumno logueado.
  getCargaAcademicaAlumno(
    periodoId?: number
  ): Observable<CargaAcademicaItem[]> {
    const url = `${this.apiUrl}/inscripciones-alumno/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();
    if (periodoId != null) {
      params = params.set('periodo_id', periodoId.toString());
    }

    return this.http.get<CargaAcademicaItem[]>(url, { headers, params });
  }

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
