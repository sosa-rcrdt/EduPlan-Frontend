import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { AulasService } from 'src/app/services/aulas.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { PeriodosService } from 'src/app/services/periodos.service';

import { UserProfile, User } from 'src/app/models/usuario.models';
import { Horario } from 'src/app/models/horarios.models';
import { Aula } from 'src/app/models/aulas.models';
import { Grupo } from 'src/app/models/grupos.models';
import { Materia } from 'src/app/models/materias.models';
import { PeriodoAcademico } from 'src/app/models/periodos.models';

interface FilaHorarioDocente {
  id: number;
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
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss'],
})
export class MaestrosScreenComponent implements OnInit {
  profile: UserProfile = null;

  periodoActivo: PeriodoAcademico | null = null;
  periodoNombre = '';

  horarios: Horario[] = [];
  filasHorario: FilaHorarioDocente[] = [];

  aulasPorId: { [id: number]: Aula } = {};
  gruposPorId: { [id: number]: Grupo } = {};
  materiasPorId: { [id: number]: Materia } = {};

  isLoading = false;
  errorMessage = '';

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
    private horariosService: HorariosService,
    private aulasService: AulasService,
    private gruposService: GruposService,
    private materiasService: MateriasService,
    private periodosService: PeriodosService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCurrentProfile();

    // Cargar catálogos y horarios
    this.cargarCatalogosBase();
    this.cargarPeriodoActivoYHorarios();
  }

  // Nombre legible del docente
  get nombreDocente(): string {
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

  // Carga materias, grupos y aulas para poder mostrar nombres legibles
  private cargarCatalogosBase(): void {
    // Materias
    this.materiasService.getMaterias().subscribe({
      next: (materias) => {
        const map: { [id: number]: Materia } = {};
        materias.forEach((m) => (map[m.id] = m));
        this.materiasPorId = map;

        if (this.horarios.length > 0) {
          this.buildFilasHorario();
        }
      },
      error: (error) => {
        console.error('Error al cargar materias', error);
      },
    });

    // Grupos
    this.gruposService.getGrupos().subscribe({
      next: (grupos) => {
        const map: { [id: number]: Grupo } = {};
        grupos.forEach((g) => (map[g.id] = g));
        this.gruposPorId = map;

        if (this.horarios.length > 0) {
          this.buildFilasHorario();
        }
      },
      error: (error) => {
        console.error('Error al cargar grupos', error);
      },
    });

    // Aulas
    this.aulasService.getAulas().subscribe({
      next: (aulas) => {
        const map: { [id: number]: Aula } = {};
        aulas.forEach((a) => (map[a.id] = a));
        this.aulasPorId = map;

        if (this.horarios.length > 0) {
          this.buildFilasHorario();
        }
      },
      error: (error) => {
        console.error('Error al cargar aulas', error);
      },
    });
  }

  // Obtiene el periodo ACTIVO y luego los horarios del docente para ese periodo
  private cargarPeriodoActivoYHorarios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.horarios = [];
    this.filasHorario = [];
    this.periodoActivo = null;
    this.periodoNombre = '';

    this.periodosService.getPeriodoActivo().subscribe({
      next: (periodo) => {
        this.periodoActivo = periodo;
        this.periodoNombre = periodo?.nombre || '';
        this.cargarHorariosDocente(periodo?.id);
      },
      error: (error) => {
        console.error('Error al obtener periodo activo', error);
        this.errorMessage =
          'No se pudo obtener el periodo académico activo.';
        this.isLoading = false;
      },
    });
  }

  // Carga los horarios del docente logueado para el periodo indicado
  private cargarHorariosDocente(periodoId?: number): void {
    this.horariosService.getHorariosDocente({ periodo_id: periodoId }).subscribe({
      next: (horarios) => {
        this.horarios = horarios || [];
        this.buildFilasHorario();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios del docente', error);

        if (error?.error?.details) {
          this.errorMessage = error.error.details;
        } else {
          this.errorMessage =
            'Ocurrió un error al cargar tus horarios. Intenta nuevamente más tarde.';
        }

        this.isLoading = false;
      },
    });
  }

  // Construye filas planas para la tabla a partir de los horarios y catálogos
  private buildFilasHorario(): void {
    const filas: FilaHorarioDocente[] = [];

    this.horarios.forEach((h) => {
      const grupo = this.gruposPorId[h.grupo];
      const materia = grupo ? this.materiasPorId[grupo.materia] : undefined;
      const aula = this.aulasPorId[h.aula];

      const dia =
        this.diasSemanaLabels[h.dia_semana] ?? String(h.dia_semana);

      const materiaNombre = materia ? materia.nombre : `Materia #${grupo?.materia ?? ''}`;
      const materiaCodigo = materia ? materia.codigo : '';
      const grupoNombre = grupo ? grupo.nombre : `Grupo #${h.grupo}`;
      const grupoSemestre = grupo ? grupo.semestre : 0;

      const aulaTexto = aula
        ? `${aula.edificio} ${aula.numero}`
        : `Aula #${h.aula}`;

      filas.push({
        id: h.id,
        materiaNombre,
        materiaCodigo,
        grupoNombre,
        grupoSemestre,
        dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        aulaTexto,
      });
    });

    this.filasHorario = filas;
  }
}
