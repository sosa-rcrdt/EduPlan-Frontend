import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Aula, AulaCreateRequest, AulaCreateResponse, AulaUpdateRequest, AulaDeleteResponse } from '../models/aulas.models';

@Injectable({
  providedIn: 'root',
})
export class AulasService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Devuelve el listado de aulas (filtros opcionales por edificio, estado y capacidad mínima).
  getAulas(
    edificio?: string,
    estado?: string,
    capacidadMin?: number
  ): Observable<Aula[]> {
    const url = `${this.apiUrl}/aulas/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (edificio) {
      params = params.set('edificio', edificio);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    if (capacidadMin != null) {
      params = params.set('capacidad_min', String(capacidadMin));
    }

    return this.http.get<Aula[]>(url, { headers, params });
  }

  // Obtiene los datos de un aula por su ID.
  getAulaById(id: number): Observable<Aula> {
    const url = `${this.apiUrl}/aula/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<Aula>(url, { headers, params });
  }

  // Crea una nueva aula.
  crearAula(payload: AulaCreateRequest): Observable<AulaCreateResponse> {
    const url = `${this.apiUrl}/aula/`;
    const headers = this.getAuthHeaders();

    return this.http.post<AulaCreateResponse>(url, payload, { headers });
  }

  // Actualiza un aula existente.
  actualizarAula(payload: AulaUpdateRequest): Observable<Aula> {
    const url = `${this.apiUrl}/aulas-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Aula>(url, payload, { headers });
  }

  // Elimina un aula por ID.
  eliminarAula(id: number): Observable<AulaDeleteResponse> {
    const url = `${this.apiUrl}/aulas-edit/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<AulaDeleteResponse>(url, { headers, params });
  }

  // Devuelve las aulas disponibles para un día y franja horaria (opcionalmente por periodo).
  getAulasDisponibles(
    dia_semana: number,
    hora_inicio: string,
    hora_fin: string,
    periodo_id?: number
  ): Observable<Aula[]> {
    const url = `${this.apiUrl}/aulas-disponibles/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams()
      .set('dia_semana', String(dia_semana))
      .set('hora_inicio', hora_inicio)
      .set('hora_fin', hora_fin);

    if (periodo_id != null) {
      params = params.set('periodo_id', String(periodo_id));
    }

    return this.http.get<Aula[]>(url, { headers, params });
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
