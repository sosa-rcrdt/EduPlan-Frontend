import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { InscripcionesService } from 'src/app/services/inscripciones.service';
import { AulasService } from 'src/app/services/aulas.service';

import {
  UserProfile,
  User,
} from 'src/app/models/usuario.models';
import { CargaAcademicaItem } from 'src/app/models/inscripciones.models';
import { Aula } from 'src/app/models/aulas.models';

interface FilaCarga {
  inscripcionId: number;
  materiaNombre: string;
  materiaCodigo: string;
  grupoNombre: string;
  grupoSemestre: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aulaTexto: string;
}

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit {
  // Perfil del usuario logueado (según lo que guardas en AuthService)
  profile: UserProfile = null;

  // Periodo actual (nombre)
  periodoNombre = '';

  // Datos crudos que vienen de /inscripciones-alumno/
  cargaAcademica: CargaAcademicaItem[] = [];

  // Aulas en mapa por id para mostrar edificio + número
  aulasPorId: { [id: number]: Aula } = {};

  // Filas ya procesadas para la tabla
  filasCarga: FilaCarga[] = [];

  // Estado de carga y errores
  isLoading = false;
  errorMessage = '';

  // Mapeo de día numérico → etiqueta en español
  private readonly diasSemanaLabels = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  constructor(
    private authService: AuthService,
    private inscripcionesService: InscripcionesService,
    private aulasService: AulasService
  ) {}

  ngOnInit(): void {
    // Perfil guardado en localStorage por AuthService
    this.profile = this.authService.getCurrentProfile();

    // Cargar catálogos base (aulas) y la carga académica del alumno
    this.cargarAulas();
    this.cargarCargaAcademica();
  }

  // Nombre legible del alumno para el encabezado
  get nombreAlumno(): string {
    if (!this.profile) {
      return '';
    }

    const p: any = this.profile as any;

    // Caso Alumno: viene un "user" anidado
    if (p.user && p.user.first_name !== undefined) {
      return `${p.user.first_name} ${p.user.last_name}`.trim();
    }

    // Caso User simple
    if ((this.profile as User).first_name !== undefined) {
      const u = this.profile as User;
      return `${u.first_name} ${u.last_name}`.trim();
    }

    return '';
  }

  // Carga todas las aulas para poder mostrar el nombre completo del aula
  private cargarAulas(): void {
    this.aulasService.getAulas().subscribe({
      next: (aulas) => {
        const map: { [id: number]: Aula } = {};
        aulas.forEach((aula) => {
          map[aula.id] = aula;
        });
        this.aulasPorId = map;

        // Una vez que tenemos aulas, podemos reconstruir las filas si ya teníamos carga
        if (this.cargaAcademica.length > 0) {
          this.buildFilasCarga();
        }
      },
      error: (error) => {
        console.error('Error al cargar aulas', error);
        // No es crítico para la pantalla; en último caso se muestra "Aula #id"
      },
    });
  }

  // Carga la carga académica del alumno logueado desde /inscripciones-alumno/
  private cargarCargaAcademica(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cargaAcademica = [];
    this.filasCarga = [];
    this.periodoNombre = '';

    this.inscripcionesService.getCargaAcademicaAlumno().subscribe({
      next: (items) => {
        this.cargaAcademica = items || [];

        // Tomar el nombre del periodo desde el primer item (si existe)
        if (this.cargaAcademica.length > 0) {
          this.periodoNombre = this.cargaAcademica[0].periodo.nombre;
        }

        this.buildFilasCarga();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar carga académica del alumno', error);

        if (error?.error?.details) {
          this.errorMessage = error.error.details;
        } else {
          this.errorMessage =
            'Ocurrió un error al cargar tu carga académica. Intenta nuevamente más tarde.';
        }

        this.isLoading = false;
      },
    });
  }

  // Construye filas planas para la tabla a partir de la respuesta de /inscripciones-alumno/
  private buildFilasCarga(): void {
    const filas: FilaCarga[] = [];

    this.cargaAcademica.forEach((item) => {
      const materia = item.materia;
      const grupo = item.grupo;

      item.horarios.forEach((h) => {
        const aula = this.aulasPorId[h.aula];

        const aulaTexto = aula
          ? `${aula.edificio} ${aula.numero}`
          : `Aula #${h.aula}`;

        const dia =
          this.diasSemanaLabels[h.dia_semana] ?? String(h.dia_semana);

        filas.push({
          inscripcionId: item.inscripcion.id,
          materiaNombre: materia.nombre,
          materiaCodigo: materia.codigo,
          grupoNombre: grupo.nombre,
          grupoSemestre: grupo.semestre,
          dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          aulaTexto,
        });
      });
    });

    this.filasCarga = filas;
  }
}
