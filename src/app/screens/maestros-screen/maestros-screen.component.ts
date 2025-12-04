import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { AulasService } from 'src/app/services/aulas.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { PeriodosService } from 'src/app/services/periodos.service';

import { UserProfile, User } from 'src/app/shared/models/usuario.models';
import { Horario } from 'src/app/shared/models/horarios.models';
import { Aula } from 'src/app/shared/models/aulas.models';
import { Grupo } from 'src/app/shared/models/grupos.models';
import { Materia } from 'src/app/shared/models/materias.models';
import { PeriodoAcademico } from 'src/app/shared/models/periodos.models';

interface FilaHorarioDocente {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aulaTexto: string;
}

interface GrupoHorariosDocente {
  grupoId: number;
  materiaNombre: string;
  materiaCodigo: string;
  grupoNombre: string;
  grupoSemestre: number | null;
  filas: FilaHorarioDocente[];
}

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss'],
})
export class MaestrosScreenComponent implements OnInit {

  public profile: UserProfile = null;

  public periodoActivo: PeriodoAcademico | null = null;
  public periodoNombre: string = '';

  public horarios: Horario[] = [];

  public aulasPorId: { [id: number]: Aula } = {};
  public gruposPorId: { [id: number]: Grupo } = {};
  public materiasPorId: { [id: number]: Materia } = {};

  // Horarios agrupados por materia / grupo
  public gruposHorarios: GrupoHorariosDocente[] = [];

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
    private horariosService: HorariosService,
    private aulasService: AulasService,
    private gruposService: GruposService,
    private materiasService: MateriasService,
    private periodosService: PeriodosService
  ) {}

  ngOnInit(): void {
    // Perfil del usuario logueado
    this.profile = this.authService.getCurrentProfile();

    // Cargar catálogos y horarios
    this.obtenerCatalogosBase();
    this.obtenerPeriodoActivoYHorarios();
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

  // ==========================
  //   Cargar catálogos base
  // ==========================
  private obtenerCatalogosBase(): void {
    // Materias
    this.materiasService.getMaterias().subscribe(
      (materias) => {
        const map: { [id: number]: Materia } = {};
        materias.forEach((m) => (map[m.id] = m));
        this.materiasPorId = map;

        if (this.horarios.length > 0) {
          this.buildGruposHorarios();
        }

        console.log('Materias cargadas (maestro): ', this.materiasPorId);
      },
      (error) => {
        console.error('Error al cargar materias', error);
      }
    );

    // Grupos
    this.gruposService.getGrupos().subscribe(
      (grupos) => {
        const map: { [id: number]: Grupo } = {};
        grupos.forEach((g) => (map[g.id] = g));
        this.gruposPorId = map;

        if (this.horarios.length > 0) {
          this.buildGruposHorarios();
        }

        console.log('Grupos cargados (maestro): ', this.gruposPorId);
      },
      (error) => {
        console.error('Error al cargar grupos', error);
      }
    );

    // Aulas
    this.aulasService.getAulas().subscribe(
      (aulas) => {
        const map: { [id: number]: Aula } = {};
        aulas.forEach((a) => (map[a.id] = a));
        this.aulasPorId = map;

        if (this.horarios.length > 0) {
          this.buildGruposHorarios();
        }

        console.log('Aulas cargadas (maestro): ', this.aulasPorId);
      },
      (error) => {
        console.error('Error al cargar aulas', error);
      }
    );
  }

  // ==========================================
  //   Obtener periodo ACTIVO y horarios
  // ==========================================
  private obtenerPeriodoActivoYHorarios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.horarios = [];
    this.gruposHorarios = [];
    this.periodoActivo = null;
    this.periodoNombre = '';

    this.periodosService.getPeriodoActivo().subscribe(
      (periodo) => {
        this.periodoActivo = periodo;
        this.periodoNombre = periodo?.nombre || '';

        const periodoId = periodo?.id;
        this.obtenerHorariosDocente(periodoId);
      },
      (error) => {
        console.error('Error al obtener periodo activo', error);
        this.errorMessage =
          'No se pudo obtener el periodo académico activo.';
        this.isLoading = false;
      }
    );
  }

  // Carga los horarios del docente logueado para el periodo indicado
  private obtenerHorariosDocente(periodoId?: number): void {
    this.horariosService.getHorariosDocente({ periodo_id: periodoId }).subscribe(
      (horarios) => {
        this.horarios = horarios || [];
        this.buildGruposHorarios();
        this.isLoading = false;

        console.log('Horarios del docente: ', this.horarios);
      },
      (error) => {
        console.error('Error al cargar horarios del docente', error);

        if (error?.error?.details) {
          this.errorMessage = error.error.details;
        } else {
          this.errorMessage =
            'Ocurrió un error al cargar tus horarios. Intenta nuevamente más tarde.';
        }

        this.isLoading = false;
      }
    );
  }

  // =====================================================
  //   Construye estructura agrupada por grupo/materia
  // =====================================================
  private buildGruposHorarios(): void {
    const mapa: { [grupoId: number]: FilaHorarioDocente[] } = {};

    this.horarios.forEach((h) => {
      const aula = this.aulasPorId[h.aula];
      const dia =
        this.diasSemanaLabels[h.dia_semana] ?? String(h.dia_semana);

      const aulaTexto = aula
        ? `${aula.edificio} ${aula.numero}`
        : `Aula #${h.aula}`;

      const fila: FilaHorarioDocente = {
        dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        aulaTexto,
      };

      if (!mapa[h.grupo]) {
        mapa[h.grupo] = [];
      }
      mapa[h.grupo].push(fila);
    });

    const grupos: GrupoHorariosDocente[] = [];

    Object.keys(mapa).forEach((key) => {
      const grupoId = Number(key);
      const grupo = this.gruposPorId[grupoId];
      const materia = grupo ? this.materiasPorId[grupo.materia] : undefined;

      const materiaNombre = materia ? materia.nombre : `Materia #${grupo?.materia ?? ''}`;
      const materiaCodigo = materia ? materia.codigo : '';
      const grupoNombre = grupo ? grupo.nombre : `Grupo #${grupoId}`;
      const grupoSemestre = grupo ? grupo.semestre : null;

      grupos.push({
        grupoId,
        materiaNombre,
        materiaCodigo,
        grupoNombre,
        grupoSemestre,
        filas: mapa[grupoId],
      });
    });

    // Orden opcional por semestre y luego por materia / grupo
    grupos.sort((a, b) => {
      const semA = a.grupoSemestre ?? 0;
      const semB = b.grupoSemestre ?? 0;
      if (semA !== semB) {
        return semA - semB;
      }
      return a.materiaNombre.localeCompare(b.materiaNombre);
    });

    this.gruposHorarios = grupos;
  }
}
