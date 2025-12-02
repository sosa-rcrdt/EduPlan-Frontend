import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ReporteUsoAulasItem, ReporteCargaDocenteItem, ReporteGrupoResponse, ReportePeriodoResumen, PublicSummaryResponse } from '../models/reportes.models';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Reporte de uso de aulas por periodo (y opcionalmente por aula).
  getReporteUsoAulas(options: {
    periodo_id: number;
    aula_id?: number;
  }): Observable<ReporteUsoAulasItem[]> {
    const url = `${this.apiUrl}/reporte-uso-aulas/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams().set(
      'periodo_id',
      String(options.periodo_id)
    );

    if (options.aula_id != null) {
      params = params.set('aula_id', String(options.aula_id));
    }

    return this.http.get<ReporteUsoAulasItem[]>(url, { headers, params });
  }

  // Reporte de carga académica por docente en un periodo.
  getReporteCargaDocente(options: {
    periodo_id: number;
    docente_id?: number;
  }): Observable<ReporteCargaDocenteItem[]> {
    const url = `${this.apiUrl}/reporte-carga-docente/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams().set(
      'periodo_id',
      String(options.periodo_id)
    );

    if (options.docente_id != null) {
      params = params.set('docente_id', String(options.docente_id));
    }

    return this.http.get<ReporteCargaDocenteItem[]>(url, { headers, params });
  }

  // Reporte de un grupo y sus horarios (opcionalmente filtrado por periodo).
  getReporteGrupo(options: {
    grupo_id: number;
    periodo_id?: number;
  }): Observable<ReporteGrupoResponse> {
    const url = `${this.apiUrl}/reporte-grupo/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams().set('grupo_id', String(options.grupo_id));

    if (options.periodo_id != null) {
      params = params.set('periodo_id', String(options.periodo_id));
    }

    return this.http.get<ReporteGrupoResponse>(url, { headers, params });
  }

  // Resumen general de un periodo.
  getReportePeriodoResumen(
    periodo_id: number
  ): Observable<ReportePeriodoResumen> {
    const url = `${this.apiUrl}/reporte-periodo-resumen/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('periodo_id', String(periodo_id));

    return this.http.get<ReportePeriodoResumen>(url, { headers, params });
  }

  // Resumen público para la landing (no requiere autenticación).
  getPublicSummary(): Observable<PublicSummaryResponse | {}> {
    const url = `${this.apiUrl}/public/summary/`;
    // Este endpoint es público, no mandamos Authorization a propósito.
    return this.http.get<PublicSummaryResponse | {}>(url);
  }

  // Headers con Authorization: Bearer <token> para reportes protegidos.
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
