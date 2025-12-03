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

interface FilaHorarioAdmin {
  id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aulaTexto: string;
}

interface GrupoHorariosAdmin {
  grupoId: number;
  display: string;
  semestre: number | null;
  filas: FilaHorarioAdmin[];
}

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss'],
})
export class AdminScreenComponent implements OnInit {

  // Usuario logueado (admin)
  public profile: UserProfile = null;
  public name_user: string = '';

  // Periodo activo
  public periodoActivo: PeriodoAcademico | null = null;
  public periodoNombre: string = '';

  // Datos crudos
  public horarios: Horario[] = [];

  // Catálogos
  public aulasPorId: { [id: number]: Aula } = {};
  public gruposPorId: { [id: number]: Grupo } = {};
  public materiasPorId: { [id: number]: Materia } = {};

  // Horarios agrupados por grupo para la vista
  public gruposHorarios: GrupoHorariosAdmin[] = [];

  // Estado
  public isLoading: boolean = false;
  public errorMessage: string = '';
  public totalHorarios: number = 0;

  // Mapeo día numérico -> etiqueta
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
    this.name_user = this.obtenerNombreAdmin();

    // Cargar catálogos y horarios
    this.obtenerCatalogosBase();
    this.obtenerPeriodoActivoYHorarios();
  }

  // Obtener nombre legible del admin
  private obtenerNombreAdmin(): string {
    if (!this.profile) {
      return '';
    }

    // Para admin, el perfil es un User plano
    const u = this.profile as User;
    if (u && u.first_name !== undefined) {
      return `${u.first_name} ${u.last_name}`.trim();
    }

    // fallback por si acaso
    const p: any = this.profile as any;
    if (p.user && p.user.first_name !== undefined) {
      return `${p.user.first_name} ${p.user.last_name}`.trim();
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

        console.log('Materias cargadas (admin): ', this.materiasPorId);
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

        console.log('Grupos cargados (admin): ', this.gruposPorId);
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

        console.log('Aulas cargadas (admin): ', this.aulasPorId);
      },
      (error) => {
        console.error('Error al cargar aulas', error);
      }
    );
  }

  // ==========================================
  //   Periodo activo y horarios generales
  // ==========================================
  private obtenerPeriodoActivoYHorarios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.horarios = [];
    this.gruposHorarios = [];
    this.periodoActivo = null;
    this.periodoNombre = '';
    this.totalHorarios = 0;

    this.periodosService.getPeriodoActivo().subscribe(
      (periodo) => {
        this.periodoActivo = periodo;
        this.periodoNombre = periodo?.nombre || '';

        const periodoId = periodo?.id;
        this.obtenerHorarios(periodoId);
      },
      (error) => {
        console.error('Error al obtener periodo activo', error);
        this.errorMessage =
          'No se pudo obtener el periodo académico activo.';
        this.isLoading = false;
      }
    );
  }

  // Cargar todos los horarios (admin) para el periodo dado
  private obtenerHorarios(periodoId?: number): void {
    this.horariosService.getHorarios({ periodo_id: periodoId }).subscribe(
      (horarios) => {
        this.horarios = horarios || [];
        this.totalHorarios = this.horarios.length;
        this.buildGruposHorarios();
        this.isLoading = false;

        console.log('Horarios cargados (admin): ', this.horarios);
      },
      (error) => {
        console.error('Error al cargar horarios', error);

        if (error?.error?.details) {
          this.errorMessage = error.error.details;
        } else {
          this.errorMessage =
            'Ocurrió un error al cargar los horarios. Intenta nuevamente más tarde.';
        }

        this.isLoading = false;
      }
    );
  }

  // =====================================================
  //   Construye estructura agrupada por grupo para vista
  // =====================================================
  private buildGruposHorarios(): void {
    const mapa: { [grupoId: number]: FilaHorarioAdmin[] } = {};

    this.horarios.forEach((h) => {
      const grupoId = h.grupo;

      const aula = this.aulasPorId[h.aula];
      const dia =
        this.diasSemanaLabels[h.dia_semana] ?? String(h.dia_semana);

      const aulaTexto = aula
        ? `${aula.edificio} ${aula.numero}`
        : `Aula #${h.aula}`;

      const fila: FilaHorarioAdmin = {
        id: h.id,
        dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        aulaTexto,
      };

      if (!mapa[grupoId]) {
        mapa[grupoId] = [];
      }
      mapa[grupoId].push(fila);
    });

    const grupos: GrupoHorariosAdmin[] = [];

    Object.keys(mapa).forEach((key) => {
      const grupoId = Number(key);
      const grupo = this.gruposPorId[grupoId];
      const materia = grupo ? this.materiasPorId[grupo.materia] : undefined;

      const materiaNombre = materia ? materia.nombre : `Materia #${grupo?.materia ?? ''}`;
      const materiaCodigo = materia ? materia.codigo : '';
      const grupoNombre = grupo ? grupo.nombre : `Grupo #${grupoId}`;
      const grupoSemestre = grupo ? grupo.semestre : null;

      let display = materiaNombre;
      if (materiaCodigo) {
        display += ` (${materiaCodigo})`;
      }
      display += ` - ${grupoNombre}`;

      grupos.push({
        grupoId,
        display,
        semestre: grupoSemestre,
        filas: mapa[grupoId],
      });
    });

    // Ordenar por semestre y luego por nombre de grupo
    grupos.sort((a, b) => {
      const semA = a.semestre ?? 0;
      const semB = b.semestre ?? 0;
      if (semA !== semB) {
        return semA - semB;
      }
      return a.display.localeCompare(b.display);
    });

    this.gruposHorarios = grupos;
  }
}
