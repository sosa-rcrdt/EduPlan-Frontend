import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface Notificacion {
    id: number;
    usuario_id: number;
    mensaje: string;
    leida: boolean;
    fecha_creacion: string;
    tipo: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {
    private readonly apiUrl = environment.url_api;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Obtener notificaciones del usuario logueado
    getNotificaciones(): Observable<Notificacion[]> {
        const url = `${this.apiUrl}/notificaciones/`;
        const headers = this.getAuthHeaders();
        return this.http.get<Notificacion[]>(url, { headers });
    }

    // Eliminar una notificación (marcar como leída/borrada)
    eliminarNotificacion(id: number): Observable<any> {
        const url = `${this.apiUrl}/notificaciones/`;
        const headers = this.getAuthHeaders();
        const params = new HttpParams().set('id', String(id));
        return this.http.delete(url, { headers, params });
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
