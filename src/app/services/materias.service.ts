// src/app/services/materias.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import {
  Materia,
  MateriaCreateRequest,
  MateriaCreateResponse,
  MateriaUpdateRequest,
  MateriaDeleteResponse,
} from '../models/materias.models';

@Injectable({
  providedIn: 'root',
})
export class MateriasService {
  private readonly apiUrl = environment.url_api;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Devuelve el listado de materias, con filtros opcionales por área académica y búsqueda.
  getMaterias(area_academica?: string, search?: string): Observable<Materia[]> {
    const url = `${this.apiUrl}/materias/`;
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (area_academica) {
      params = params.set('area_academica', area_academica);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Materia[]>(url, { headers, params });
  }

  // Obtiene una materia por su ID.
  getMateriaById(id: number): Observable<Materia> {
    const url = `${this.apiUrl}/materia/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.get<Materia>(url, { headers, params });
  }

  // Crea una nueva materia.
  crearMateria(payload: MateriaCreateRequest): Observable<MateriaCreateResponse> {
    const url = `${this.apiUrl}/materia/`;
    const headers = this.getAuthHeaders();

    return this.http.post<MateriaCreateResponse>(url, payload, { headers });
  }

  // Actualiza una materia existente.
  actualizarMateria(payload: MateriaUpdateRequest): Observable<Materia> {
    const url = `${this.apiUrl}/materias-edit/`;
    const headers = this.getAuthHeaders();

    return this.http.put<Materia>(url, payload, { headers });
  }

  // Elimina una materia por ID.
  eliminarMateria(id: number): Observable<MateriaDeleteResponse> {
    const url = `${this.apiUrl}/materias-edit/`;
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('id', String(id));

    return this.http.delete<MateriaDeleteResponse>(url, { headers, params });
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
