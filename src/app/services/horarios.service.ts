import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import {
  Horario,
  HorarioCreateRequest,
  HorarioCreateResponse,
  HorarioUpdateRequest,
  HorarioDeleteResponse,
} from '../shared/models/horarios.models';

@Injectable({
  providedIn: 'root',
})
export class HorariosService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Devuelve el listado de horarios (filtros opcionales por periodo, grupo, aula, docente y día).
  getHorarios(options?: {
    periodo_id?: number;
    grupo_id?: number;
    aula_id?: number;
    docente_id?: number;
    dia_semana?: number;
  }): Observable<Horario[]> {
    const url = `${this.apiUrl}/horarios/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (options?.periodo_id != null) {
      params = params.set('periodo_id', String(options.periodo_id));
    }

    if (options?.grupo_id != null) {
      params = params.set('grupo_id', String(options.grupo_id));
    }

    if (options?.aula_id != null) {
      params = params.set('aula_id', String(options.aula_id));
    }

    if (options?.docente_id != null) {
      params = params.set('docente_id', String(options.docente_id));
    }

    if (options?.dia_semana != null) {
      params = params.set('dia_semana', String(options.dia_semana));
    }

    return this.http.get<Horario[]>(url, { headers, params });
  }

  // Obtiene un horario por su ID.
  getHorarioById(id: number): Observable<Horario> {
    const url = `${this.apiUrl}/horario/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<Horario>(url, { headers, params });
  }

  // Crea un nuevo horario.
  crearHorario(payload: HorarioCreateRequest): Observable<HorarioCreateResponse> {
    const url = `${this.apiUrl}/horarios/`;
    const headers = this.getAuthHeaders();

    return this.http.post<HorarioCreateResponse>(url, payload, { headers });
  }

  // Actualiza un horario existente.
  actualizarHorario(payload: HorarioUpdateRequest): Observable<Horario> {
    const url = `${this.apiUrl}/horario/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Horario>(url, payload, { headers });
  }

  // Elimina un horario por ID.
  eliminarHorario(id: number): Observable<HorarioDeleteResponse> {
    const url = `${this.apiUrl}/horario/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<HorarioDeleteResponse>(url, { headers, params });
  }

  // Devuelve los horarios del docente logueado (opcionalmente filtrados por periodo y día).
  getHorariosDocente(options?: {
    periodo_id?: number;
    dia_semana?: number;
  }): Observable<Horario[]> {
    const url = `${this.apiUrl}/horarios-docente/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (options?.periodo_id != null) {
      params = params.set('periodo_id', String(options.periodo_id));
    }

    if (options?.dia_semana != null) {
      params = params.set('dia_semana', String(options.dia_semana));
    }

    return this.http.get<Horario[]>(url, { headers, params });
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
