import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { PeriodoAcademico, PeriodoCreateRequest, PeriodoCreateResponse, PeriodoUpdateRequest, PeriodoDeleteResponse } from '../shared/models/periodos.models';

@Injectable({
  providedIn: 'root',
})
export class PeriodosService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Devuelve la lista completa de periodos académicos.
  getPeriodos(): Observable<PeriodoAcademico[]> {
    const url = `${this.apiUrl}/periodos/`;
    const headers = this.getAuthHeaders();

    return this.http.get<PeriodoAcademico[]>(url, { headers });
  }

  // Obtiene un periodo académico por su ID.
  getPeriodoById(id: number): Observable<PeriodoAcademico> {
    const url = `${this.apiUrl}/periodo/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<PeriodoAcademico>(url, { headers, params });
  }

  // Crea un nuevo periodo académico.
  crearPeriodo(payload: PeriodoCreateRequest): Observable<PeriodoCreateResponse> {
    const url = `${this.apiUrl}/periodo/`;
    const headers = this.getAuthHeaders();

    return this.http.post<PeriodoCreateResponse>(url, payload, { headers });
  }

  // Actualiza un periodo académico existente (usa /periodos-edit/ PUT).
  actualizarPeriodo(payload: PeriodoUpdateRequest): Observable<PeriodoAcademico> {
    const url = `${this.apiUrl}/periodos-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<PeriodoAcademico>(url, payload, { headers });
  }

  // Elimina un periodo académico por ID (usa /periodos-edit/ DELETE).
  eliminarPeriodo(id: number): Observable<PeriodoDeleteResponse> {
    const url = `${this.apiUrl}/periodos-edit/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<PeriodoDeleteResponse>(url, { headers, params });
  }

  // Devuelve el periodo académico activo (o null si no hay).
  getPeriodoActivo(): Observable<PeriodoAcademico | null> {
    const url = `${this.apiUrl}/periodo-activo/`;

    // Este endpoint es público (AllowAny), así que no es obligatorio mandar Authorization.
    return this.http.get<PeriodoAcademico | {}>(url).pipe(
      map((response: any) => {
        if (response && response.id) {
          return response as PeriodoAcademico;
        }
        return null;
      })
    );
  }

  // Marca un periodo como ACTIVO y desactiva los demás.
  setPeriodoActivo(id: number): Observable<PeriodoAcademico> {
    const url = `${this.apiUrl}/periodo-set-activo/`;
    const headers = this.getAuthHeaders();

    const body = { id };

    return this.http.post<PeriodoAcademico>(url, body, { headers });
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
