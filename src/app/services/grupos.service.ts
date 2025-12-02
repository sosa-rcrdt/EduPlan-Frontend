// src/app/services/grupos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import {
  Grupo,
  GrupoCreateRequest,
  GrupoCreateResponse,
  GrupoUpdateRequest,
  GrupoDeleteResponse,
} from '../models/grupos.models';

@Injectable({
  providedIn: 'root',
})
export class GruposService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Devuelve la lista de grupos con filtros opcionales (materia, semestre, búsqueda).
  getGrupos(
    materia_id?: number,
    semestre?: number,
    search?: string
  ): Observable<Grupo[]> {
    const url = `${this.apiUrl}/grupos/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (materia_id != null) {
      params = params.set('materia_id', String(materia_id));
    }

    if (semestre != null) {
      params = params.set('semestre', String(semestre));
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Grupo[]>(url, { headers, params });
  }

  // Obtiene un grupo por su ID.
  getGrupoById(id: number): Observable<Grupo> {
    const url = `${this.apiUrl}/grupo/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<Grupo>(url, { headers, params });
  }

  // Crea un nuevo grupo.
  crearGrupo(payload: GrupoCreateRequest): Observable<GrupoCreateResponse> {
    const url = `${this.apiUrl}/grupo/`;
    const headers = this.getAuthHeaders();

    return this.http.post<GrupoCreateResponse>(url, payload, { headers });
  }

  // Actualiza un grupo existente.
  actualizarGrupo(payload: GrupoUpdateRequest): Observable<Grupo> {
    const url = `${this.apiUrl}/grupos-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Grupo>(url, payload, { headers });
  }

  // Elimina un grupo por ID.
  eliminarGrupo(id: number): Observable<GrupoDeleteResponse> {
    const url = `${this.apiUrl}/grupos-edit/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<GrupoDeleteResponse>(url, { headers, params });
  }

  // Devuelve los horarios asociados a un grupo (usa /grupo-horarios/).
  getHorariosDeGrupo(grupoId: number): Observable<any[]> {
    const url = `${this.apiUrl}/grupo-horarios/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('grupo_id', String(grupoId));

    // Más adelante se puede tipar con una interfaz Horario cuando tengas horarios.models.ts
    return this.http.get<any[]>(url, { headers, params });
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
