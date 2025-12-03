import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { UserProfile, User } from 'src/app/models/usuario.models';
import { Horario } from 'src/app/models/horarios.models';
import { Grupo } from 'src/app/models/grupos.models';
import { Materia } from 'src/app/models/materias.models';
import { PeriodoAcademico } from 'src/app/models/periodos.models';
import {
  SolicitudCambio,
  SolicitudCreateRequest,
  EstadoSolicitud,
} from 'src/app/models/solicitudes.models';

interface GrupoOpcionSolicitud {
  grupoId: number;
  display: string;
}

@Component({
  selector: 'app-solicitudes-screen',
  templateUrl: './solicitudes-screen.component.html',
  styleUrls: ['./solicitudes-screen.component.scss'],
})
export class SolicitudesScreenComponent implements OnInit {

  // Perfil del usuario logueado
  public profile: UserProfile = null;

  // Periodo activo
  public periodoActivo: PeriodoAcademico | null = null;
  public periodoNombre: string = '';

  // Catálogos y horarios
  public horariosDocente: Horario[] = [];
  public gruposPorId: { [id: number]: Grupo } = {};
  public materiasPorId: { [id: number]: Materia } = {};

  // Opciones de grupo para el formulario
  public opcionesGrupo: GrupoOpcionSolicitud[] = [];

  // Formulario
  public selectedGrupoId: number | null = null;
  public diaSemanaPropuesto: number | null = null;
  public horaInicioPropuesta: string = '';
  public horaFinPropuesta: string = '';
  public motivo: string = '';

  public isSubmitting: boolean = false;
  public formError: string = '';

  // Solicitudes existentes del docente
  public solicitudes: SolicitudCambio[] = [];
  public isLoadingSolicitudes: boolean = false;

  // Estado general de carga inicial
  public isLoadingInicial: boolean = false;
  public errorInicial: string = '';

  // 0 = Lunes, 1 = Martes, ...
  public diasSemanaLabels: string[] = [
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
    private gruposService: GruposService,
    private materiasService: MateriasService,
    private periodosService: PeriodosService,
    private solicitudesService: SolicitudesService
  ) { }

  ngOnInit(): void {
    this.profile = this.authService.getCurrentProfile();
    this.obtenerCatalogosBase();
    this.obtenerPeriodoActivoYHorarios();
    this.obtenerSolicitudesDocente();
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

  // Validez mínima del formulario
  get esFormularioValido(): boolean {
    return (
      !!this.selectedGrupoId &&
      this.diaSemanaPropuesto !== null &&
      this.diaSemanaPropuesto !== undefined &&
      !!this.horaInicioPropuesta &&
      !!this.horaFinPropuesta &&
      this.motivo.trim().length >= 10
    );
  }

  private obtenerCatalogosBase(): void {
    // Materias
    this.materiasService.getMaterias().subscribe(
      (materias) => {
        const map: { [id: number]: Materia } = {};
        materias.forEach((m) => (map[m.id] = m));
        this.materiasPorId = map;
        this.buildOpcionesGrupo();

        console.log('Materias cargadas (solicitud maestro): ', this.materiasPorId);
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
        this.buildOpcionesGrupo();

        console.log('Grupos cargados (solicitud maestro): ', this.gruposPorId);
      },
      (error) => {
        console.error('Error al cargar grupos', error);
      }
    );
  }

  private obtenerPeriodoActivoYHorarios(): void {
    this.isLoadingInicial = true;
    this.errorInicial = '';
    this.periodoActivo = null;
    this.periodoNombre = '';
    this.horariosDocente = [];
    this.opcionesGrupo = [];

    this.periodosService.getPeriodoActivo().subscribe(
      (periodo) => {
        this.periodoActivo = periodo;
        this.periodoNombre = periodo?.nombre || '';

        const periodoId = periodo?.id;
        this.horariosService.getHorariosDocente({ periodo_id: periodoId }).subscribe(
          (horarios) => {
            this.horariosDocente = horarios || [];
            this.buildOpcionesGrupo();
            this.isLoadingInicial = false;

            console.log('Horarios del docente (solicitud): ', this.horariosDocente);
          },
          (error) => {
            console.error('Error al cargar horarios del docente', error);
            this.errorInicial =
              'No se pudo cargar tus horarios para el periodo activo.';
            this.isLoadingInicial = false;
          }
        );
      },
      (error) => {
        console.error('Error al obtener periodo activo', error);
        this.errorInicial =
          'No se pudo obtener el periodo académico activo.';
        this.isLoadingInicial = false;
      }
    );
  }

  // Construye las opciones de grupo para el combo
  private buildOpcionesGrupo(): void {
    if (!this.horariosDocente || this.horariosDocente.length === 0) {
      this.opcionesGrupo = [];
      return;
    }

    const idsUnicos = Array.from(
      new Set(this.horariosDocente.map((h) => h.grupo))
    );

    const opciones: GrupoOpcionSolicitud[] = [];

    idsUnicos.forEach((grupoId) => {
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
      if (grupoSemestre !== null) {
        display += ` - Sem ${grupoSemestre}`;
      }

      opciones.push({
        grupoId,
        display,
      });
    });

    this.opcionesGrupo = opciones;
  }

  private obtenerSolicitudesDocente(): void {
    this.isLoadingSolicitudes = true;

    this.solicitudesService.getSolicitudesDocente().subscribe(
      (solicitudes) => {
        this.solicitudes = solicitudes || [];
        this.isLoadingSolicitudes = false;

        console.log('Solicitudes del docente: ', this.solicitudes);
      },
      (error) => {
        console.error('Error al cargar solicitudes del docente', error);
        this.isLoadingSolicitudes = false;
      }
    );
  }

  public onSubmit(): void {
    this.formError = '';

    if (!this.esFormularioValido || !this.selectedGrupoId) {
      this.formError =
        'Completa todos los campos y describe el motivo con al menos 10 caracteres.';
      return;
    }

    if (!this.periodoActivo) {
      this.formError =
        'No hay un periodo académico activo. No es posible enviar la solicitud.';
      return;
    }

    const payload: SolicitudCreateRequest = {
      grupo: this.selectedGrupoId,
      dia_semana_propuesto: this.diaSemanaPropuesto as number,
      hora_inicio_propuesta: this.horaInicioPropuesta,
      hora_fin_propuesta: this.horaFinPropuesta,
      motivo: this.motivo.trim(),
    };

    this.isSubmitting = true;

    this.solicitudesService.crearSolicitud(payload).subscribe(
      () => {
        this.isSubmitting = false;

        // Aviso al estilo de tu profe
        alert('Solicitud enviada correctamente.');

        // Limpiar campos del formulario
        this.motivo = '';
        this.diaSemanaPropuesto = null;
        this.horaInicioPropuesta = '';
        this.horaFinPropuesta = '';

        // Recargar listado de solicitudes
        this.obtenerSolicitudesDocente();
      },
      (error) => {
        console.error('Error al crear solicitud de cambio', error);
        this.isSubmitting = false;

        if (error?.error?.details) {
          this.formError = error.error.details;
        } else {
          this.formError =
            'Ocurrió un error al enviar la solicitud. Intenta nuevamente más tarde.';
        }
      }
    );
  }

  public getGrupoDisplay(grupoId: number): string {
    const grupo = this.gruposPorId[grupoId];
    if (!grupo) {
      return `Grupo #${grupoId}`;
    }
    const materia = this.materiasPorId[grupo.materia];
    const materiaParte = materia
      ? `${materia.nombre} (${materia.codigo})`
      : `Materia #${grupo.materia}`;
    return `${materiaParte} - ${grupo.nombre}`;
  }

  public getEstadoLabel(estado: EstadoSolicitud): string {
    if (estado === 'PENDIENTE') return 'Pendiente';
    if (estado === 'APROBADA') return 'Aprobada';
    if (estado === 'RECHAZADA') return 'Rechazada';
    return estado;
  }

  public getDiaLabel(diaIndex: number | null): string {
    if (diaIndex === null || diaIndex === undefined) {
      return '—';
    }
    return this.diasSemanaLabels[diaIndex] ?? String(diaIndex);
  }

  public getHorarioPropuesto(sol: SolicitudCambio): string {
    const inicio = sol.hora_inicio_propuesta;
    const fin = sol.hora_fin_propuesta;

    if (!inicio || !fin) {
      return '—';
    }

    const i = inicio.substring(0, 5);
    const f = fin.substring(0, 5);

    return `${i} - ${f}`;
  }
}
