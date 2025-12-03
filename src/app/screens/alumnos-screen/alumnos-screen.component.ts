import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { InscripcionesService } from 'src/app/services/inscripciones.service';
import { AulasService } from 'src/app/services/aulas.service';

import { UserProfile, User } from 'src/app/models/usuario.models';
import { CargaAcademicaItem } from 'src/app/models/inscripciones.models';
import { Aula } from 'src/app/models/aulas.models';

interface FilaHorarioAlumno {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aulaTexto: string;
}

interface GrupoCargaAlumno {
  inscripcionId: number;
  materiaNombre: string;
  materiaCodigo: string;
  grupoNombre: string;
  grupoSemestre: number;
  filas: FilaHorarioAlumno[];
}

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit {

  // Perfil del usuario logueado (según lo que guardas en AuthService)
  public profile: UserProfile = null;

  // Periodo actual (nombre)
  public periodoNombre: string = '';

  // Datos crudos que vienen de /inscripciones-alumno/
  public cargaAcademica: CargaAcademicaItem[] = [];

  // Aulas en mapa por id para mostrar edificio + número
  public aulasPorId: { [id: number]: Aula } = {};

  // Grupos / materias con sus horarios para la vista
  public gruposCarga: GrupoCargaAlumno[] = [];

  // Estado de carga y errores
  public isLoading: boolean = false;
  public errorMessage: string = '';

  // Mapeo de día numérico → etiqueta en español
  private diasSemanaLabels: string[] = [
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
    this.obtenerAulas();
    this.obtenerCargaAcademica();
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

  // ==========================
  //   Cargar catálogos (aulas)
  // ==========================
  private obtenerAulas(): void {
    this.aulasService.getAulas().subscribe(
      (aulas) => {
        const map: { [id: number]: Aula } = {};
        aulas.forEach((aula) => {
          map[aula.id] = aula;
        });
        this.aulasPorId = map;

        // Si ya teníamos carga académica, reconstruir grupos
        if (this.cargaAcademica.length > 0) {
          this.buildGruposCarga();
        }

        console.log('Aulas cargadas (alumno): ', this.aulasPorId);
      },
      (error) => {
        console.error('Error al cargar aulas', error);
        // No es crítico; se mostrará "Aula #id" en último caso
      }
    );
  }

  // ==========================================
  //   Cargar carga académica del alumno
  // ==========================================
  private obtenerCargaAcademica(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cargaAcademica = [];
    this.gruposCarga = [];
    this.periodoNombre = '';

    this.inscripcionesService.getCargaAcademicaAlumno().subscribe(
      (items) => {
        this.cargaAcademica = items || [];

        // Tomar el nombre del periodo desde el primer item (si existe)
        if (this.cargaAcademica.length > 0) {
          this.periodoNombre = this.cargaAcademica[0].periodo.nombre;
        }

        this.buildGruposCarga();
        this.isLoading = false;

        console.log('Carga académica del alumno: ', this.cargaAcademica);
      },
      (error) => {
        console.error('Error al cargar carga académica del alumno', error);

        if (error?.error?.details) {
          this.errorMessage = error.error.details;
        } else {
          this.errorMessage =
            'Ocurrió un error al cargar tu carga académica. Intenta nuevamente más tarde.';
        }

        this.isLoading = false;
      }
    );
  }

  // =========================================================
  //   Construye grupos (materia + grupo) con sus horarios
  // =========================================================
  private buildGruposCarga(): void {
    const grupos: GrupoCargaAlumno[] = [];

    this.cargaAcademica.forEach((item) => {
      const materia = item.materia;
      const grupo = item.grupo;

      const filas: FilaHorarioAlumno[] = [];

      item.horarios.forEach((h) => {
        const aula = this.aulasPorId[h.aula];

        const aulaTexto = aula
          ? `${aula.edificio} ${aula.numero}`
          : `Aula #${h.aula}`;

        const dia =
          this.diasSemanaLabels[h.dia_semana] ?? String(h.dia_semana);

        filas.push({
          dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          aulaTexto,
        });
      });

      grupos.push({
        inscripcionId: item.inscripcion.id,
        materiaNombre: materia.nombre,
        materiaCodigo: materia.codigo,
        grupoNombre: grupo.nombre,
        grupoSemestre: grupo.semestre,
        filas,
      });
    });

    this.gruposCarga = grupos;
  }
}
