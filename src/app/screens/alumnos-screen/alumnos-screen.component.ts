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

  // Perfil del usuario logueado
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
  ) { }

  ngOnInit(): void {
    this.profile = this.authService.getCurrentProfile();
    this.cargarAulas();
    this.cargarCargaAcademica();
  }

  // Nombre legible del alumno
  get nombreAlumno(): string {
    if (!this.profile) {
      return '';
    }

    const p: any = this.profile as any;

    if (p.user && p.user.first_name !== undefined) {
      return `${p.user.first_name} ${p.user.last_name}`.trim();
    }

    if ((this.profile as User).first_name !== undefined) {
      const u = this.profile as User;
      return `${u.first_name} ${u.last_name}`.trim();
    }

    return '';
  }

  private cargarAulas(): void {
    this.aulasService.getAulas().subscribe(
      (aulas) => {
        const map: { [id: number]: Aula } = {};
        aulas.forEach((a) => (map[a.id] = a));
        this.aulasPorId = map;
      },
      (error) => {
        console.error('Error al cargar aulas', error);
      }
    );
  }

  private cargarCargaAcademica(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cargaAcademica = [];
    this.gruposCarga = [];

    this.inscripcionesService.getCargaAcademicaAlumno().subscribe(
      (carga) => {
        this.cargaAcademica = carga || [];

        // Extraer nombre del periodo (si viene en el primer item)
        if (this.cargaAcademica.length > 0) {
          const primerItem = this.cargaAcademica[0];
          this.periodoNombre = primerItem.periodo?.nombre || '';
        }

        // Construir grupos para la vista
        this.buildGruposCarga();

        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar carga académica', error);
        this.errorMessage =
          'No se pudo cargar tu carga académica. Intenta nuevamente más tarde.';
        this.isLoading = false;
      }
    );
  }

  private buildGruposCarga(): void {
    const grupos: GrupoCargaAlumno[] = [];

    this.cargaAcademica.forEach((item) => {
      const grupo: GrupoCargaAlumno = {
        inscripcionId: item.inscripcion.id,
        materiaNombre: item.materia?.nombre || '',
        materiaCodigo: item.materia?.codigo || '',
        grupoNombre: item.grupo?.nombre || '',
        grupoSemestre: item.grupo?.semestre || 0,
        filas: [],
      };

      // Construir filas de horario
      if (item.horarios && item.horarios.length > 0) {
        item.horarios.forEach((horario) => {
          const diaLabel = this.getDiaLabel(horario.dia_semana);
          const aulaTexto = this.getAulaTexto(horario.aula);

          grupo.filas.push({
            dia: diaLabel,
            hora_inicio: horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '',
            hora_fin: horario.hora_fin ? horario.hora_fin.substring(0, 5) : '',
            aulaTexto,
          });
        });
      }

      grupos.push(grupo);
    });

    this.gruposCarga = grupos;
  }

  private getDiaLabel(diaIndex: number | null): string {
    if (diaIndex === null || diaIndex === undefined) {
      return '—';
    }
    return this.diasSemanaLabels[diaIndex] ?? String(diaIndex);
  }

  private getAulaTexto(aulaId: number | null): string {
    if (!aulaId) {
      return '—';
    }
    const aula = this.aulasPorId[aulaId];
    if (!aula) {
      return `Aula #${aulaId}`;
    }
    return `${aula.edificio} - ${aula.numero}`;
  }
}
