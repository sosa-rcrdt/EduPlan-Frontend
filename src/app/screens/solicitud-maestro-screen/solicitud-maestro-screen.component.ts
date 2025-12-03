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
  selector: 'app-solicitud-maestro-screen',
  templateUrl: './solicitud-maestro-screen.component.html',
  styleUrls: ['./solicitud-maestro-screen.component.scss'],
})
export class SolicitudMaestroScreenComponent implements OnInit {
  // Perfil del usuario logueado
  profile: UserProfile = null;

  // Periodo activo
  periodoActivo: PeriodoAcademico | null = null;
  periodoNombre = '';

  // Catálogos y horarios
  horariosDocente: Horario[] = [];
  gruposPorId: { [id: number]: Grupo } = {};
  materiasPorId: { [id: number]: Materia } = {};

  // Opciones de grupo para el formulario (solo grupos del docente)
  opcionesGrupo: GrupoOpcionSolicitud[] = [];

  // Formulario
  selectedGrupoId: number | null = null;
  fechaPropuesta = '';
  motivo = '';

  isSubmitting = false;
  formError = '';
  formSuccess = '';

  // Solicitudes existentes del docente
  solicitudes: SolicitudCambio[] = [];
  isLoadingSolicitudes = false;

  // Estado general de carga
  isLoadingInicial = false;
  errorInicial = '';

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
    private gruposService: GruposService,
    private materiasService: MateriasService,
    private periodosService: PeriodosService,
    private solicitudesService: SolicitudesService
  ) {}

  ngOnInit(): void {
    this.profile = this.authService.getCurrentProfile();
    this.cargarCatalogosBase();
    this.cargarPeriodoActivoYHorarios();
    this.cargarSolicitudesDocente();
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
      !!this.fechaPropuesta &&
      this.motivo.trim().length >= 10
    );
  }

  // ==== CARGA INICIAL ====

  private cargarCatalogosBase(): void {
    // Materias
    this.materiasService.getMaterias().subscribe({
      next: (materias) => {
        const map: { [id: number]: Materia } = {};
        materias.forEach((m) => (map[m.id] = m));
        this.materiasPorId = map;
        this.buildOpcionesGrupo();
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
        this.buildOpcionesGrupo();
      },
      error: (error) => {
        console.error('Error al cargar grupos', error);
      },
    });
  }

  private cargarPeriodoActivoYHorarios(): void {
    this.isLoadingInicial = true;
    this.errorInicial = '';
    this.periodoActivo = null;
    this.periodoNombre = '';
    this.horariosDocente = [];
    this.opcionesGrupo = [];

    this.periodosService.getPeriodoActivo().subscribe({
      next: (periodo) => {
        this.periodoActivo = periodo;
        this.periodoNombre = periodo?.nombre || '';

        const periodoId = periodo?.id;
        this.horariosService.getHorariosDocente({ periodo_id: periodoId }).subscribe({
          next: (horarios) => {
            this.horariosDocente = horarios || [];
            this.buildOpcionesGrupo();
            this.isLoadingInicial = false;
          },
          error: (error) => {
            console.error('Error al cargar horarios del docente', error);
            this.errorInicial =
              'No se pudo cargar tus horarios para el periodo activo.';
            this.isLoadingInicial = false;
          },
        });
      },
      error: (error) => {
        console.error('Error al obtener periodo activo', error);
        this.errorInicial =
          'No se pudo obtener el periodo académico activo.';
        this.isLoadingInicial = false;
      },
    });
  }

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

  // ==== SOLICITUDES EXISTENTES ====

  private cargarSolicitudesDocente(): void {
    this.isLoadingSolicitudes = true;
    this.solicitudesService.getSolicitudesDocente().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes || [];
        this.isLoadingSolicitudes = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes del docente', error);
        this.isLoadingSolicitudes = false;
      },
    });
  }

  // ==== FORMULARIO ====

  onSubmit(): void {
    this.formError = '';
    this.formSuccess = '';

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
      fecha_propuesta: this.fechaPropuesta,
      motivo: this.motivo.trim(),
    };

    this.isSubmitting = true;

    this.solicitudesService.crearSolicitud(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formSuccess = 'Solicitud enviada correctamente.';
        this.motivo = '';
        this.fechaPropuesta = '';
        // Opcional: mantener seleccionado el mismo grupo
        this.cargarSolicitudesDocente();
      },
      error: (error) => {
        console.error('Error al crear solicitud de cambio', error);
        this.isSubmitting = false;

        if (error?.error?.details) {
          this.formError = error.error.details;
        } else {
          this.formError =
            'Ocurrió un error al enviar la solicitud. Intenta nuevamente más tarde.';
        }
      },
    });
  }

  // ==== HELPERS PARA LA TABLA DE SOLICITUDES ====

  getGrupoDisplay(grupoId: number): string {
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

  getEstadoLabel(estado: EstadoSolicitud): string {
    if (estado === 'PENDIENTE') return 'Pendiente';
    if (estado === 'APROBADA') return 'Aprobada';
    if (estado === 'RECHAZADA') return 'Rechazada';
    return estado;
  }
}
