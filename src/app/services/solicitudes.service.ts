import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

import {
  SolicitudCambio,
  SolicitudCreateRequest,
  SolicitudCreateResponse,
  SolicitudUpdateRequest,
  SolicitudDeleteResponse,
  EstadoSolicitud,
} from '../models/solicitudes.models';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Lista de solicitudes (admin), con filtros opcionales por estado, grupo y docente.
  getSolicitudes(options?: {
    estado?: EstadoSolicitud;
    grupo_id?: number;
    docente_id?: number;
  }): Observable<SolicitudCambio[]> {
    const url = `${this.apiUrl}/solicitudes/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (options?.estado) {
      params = params.set('estado', options.estado);
    }
    if (options?.grupo_id != null) {
      params = params.set('grupo_id', String(options.grupo_id));
    }
    if (options?.docente_id != null) {
      params = params.set('docente_id', String(options.docente_id));
    }

    return this.http.get<SolicitudCambio[]>(url, { headers, params });
  }

  // Obtiene una solicitud por su ID.
  getSolicitudById(id: number): Observable<SolicitudCambio> {
    const url = `${this.apiUrl}/solicitud/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<SolicitudCambio>(url, { headers, params });
  }

  // Crea una nueva solicitud de cambio para el docente autenticado.
  crearSolicitud(
    payload: SolicitudCreateRequest
  ): Observable<SolicitudCreateResponse> {
    const url = `${this.apiUrl}/solicitud/`;
    const headers = this.getAuthHeaders();

    return this.http.post<SolicitudCreateResponse>(url, payload, { headers });
  }

  // Actualiza una solicitud (pensado para administración).
  actualizarSolicitud(
    payload: SolicitudUpdateRequest
  ): Observable<SolicitudCambio> {
    const url = `${this.apiUrl}/solicitudes-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<SolicitudCambio>(url, payload, { headers });
  }

  // Elimina una solicitud por ID.
  eliminarSolicitud(id: number): Observable<SolicitudDeleteResponse> {
    const url = `${this.apiUrl}/solicitudes-edit/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<SolicitudDeleteResponse>(url, { headers, params });
  }

  // Solicitudes del docente logueado (usa request.user en el backend).
  getSolicitudesDocente(options?: {
    estado?: EstadoSolicitud;
  }): Observable<SolicitudCambio[]> {
    const url = `${this.apiUrl}/solicitudes-docente/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();
    if (options?.estado) {
      params = params.set('estado', options.estado);
    }

    return this.http.get<SolicitudCambio[]>(url, { headers, params });
  }

  // Aprueba una solicitud (cambia estado a APROBADA y aplica el cambio de horario).
  aprobarSolicitud(id: number): Observable<SolicitudCambio> {
    const url = `${this.apiUrl}/solicitud-aprobar/`;
    const headers = this.getAuthHeaders();

    return this.http.post<SolicitudCambio>(url, { id }, { headers });
  }

  // Rechaza una solicitud (cambia estado a RECHAZADA).
  rechazarSolicitud(id: number): Observable<SolicitudCambio> {
    const url = `${this.apiUrl}/solicitud-rechazar/`;
    const headers = this.getAuthHeaders();

    return this.http.post<SolicitudCambio>(url, { id }, { headers });
  }

  // Construye headers con Authorization: Bearer <token>.
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
