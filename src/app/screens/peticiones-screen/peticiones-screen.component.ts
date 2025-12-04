import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { AuthService } from 'src/app/services/auth.service';
import { SolicitudCambio, EstadoSolicitud } from 'src/app/shared/models/solicitudes.models';
import { Horario } from 'src/app/shared/models/horarios.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-peticiones-screen',
  templateUrl: './peticiones-screen.component.html',
  styleUrls: ['./peticiones-screen.component.scss']
})
export class PeticionesScreenComponent implements OnInit {

  public solicitudes: SolicitudCambio[] = [];
  public isLoading: boolean = false;
  public errorMessage: string = '';

  @ViewChild('confirmationModal') confirmationModal!: ConfirmationModalComponent;

  public modalTitle: string = '';
  public modalMessage: string = '';
  public modalBtnConfirmText: string = '';
  public modalBtnConfirmColor: string = '';

  private solicitudSeleccionada: SolicitudCambio | null = null;
  private accionSeleccionada: 'ACEPTAR' | 'RECHAZAR' | null = null;

  constructor(
    private solicitudesService: SolicitudesService,
    private horariosService: HorariosService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    // Obtenemos solo las pendientes
    this.solicitudesService.getSolicitudes({ estado: 'PENDIENTE' }).subscribe(
      (data) => {
        this.solicitudes = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar solicitudes', error);
        this.errorMessage = 'No se pudieron cargar las solicitudes.';
        this.isLoading = false;
      }
    );
  }

  aceptarSolicitud(solicitud: SolicitudCambio): void {
    this.solicitudSeleccionada = solicitud;
    this.accionSeleccionada = 'ACEPTAR';

    this.modalTitle = 'Aceptar Solicitud';
    this.modalMessage = '¿Estás seguro de aceptar esta solicitud? Se actualizará el horario correspondiente.';
    this.modalBtnConfirmText = 'Aceptar';
    this.modalBtnConfirmColor = 'btn-success';

    this.confirmationModal.show();
  }

  rechazarSolicitud(solicitud: SolicitudCambio, motivo?: string): void {
    // Si viene con motivo, es rechazo automático (no pide confirmación manual, o sí? 
    // El código original pedía confirmación SOLO si no había motivo.
    // Si hay motivo (conflicto), se rechaza directo.

    if (motivo) {
      this.ejecutarRechazo(solicitud, motivo);
      return;
    }

    this.solicitudSeleccionada = solicitud;
    this.accionSeleccionada = 'RECHAZAR';

    this.modalTitle = 'Rechazar Solicitud';
    this.modalMessage = '¿Estás seguro de rechazar esta solicitud?';
    this.modalBtnConfirmText = 'Rechazar';
    this.modalBtnConfirmColor = 'btn-danger';

    this.confirmationModal.show();
  }

  public onConfirmarAccion(): void {
    if (!this.solicitudSeleccionada || !this.accionSeleccionada) return;

    if (this.accionSeleccionada === 'ACEPTAR') {
      this.ejecutarAceptacion(this.solicitudSeleccionada);
    } else if (this.accionSeleccionada === 'RECHAZAR') {
      this.ejecutarRechazo(this.solicitudSeleccionada);
    }

    // Reset
    this.solicitudSeleccionada = null;
    this.accionSeleccionada = null;
  }

  private ejecutarAceptacion(solicitud: SolicitudCambio): void {
    this.isLoading = true;

    // 1. Validar solapamiento
    const grupoId = solicitud.grupo;

    // Necesitamos saber el periodo del grupo.
    this.horariosService.getHorarios({ grupo_id: grupoId }).subscribe(
      (horariosGrupo) => {
        let periodoId: number | undefined;
        if (horariosGrupo.length > 0) {
          periodoId = horariosGrupo[0].periodo;
        }

        const params: any = {
          dia_semana: solicitud.dia_semana_propuesto
        };
        if (periodoId) {
          params.periodo_id = periodoId;
        }

        // Traemos horarios que podrían afectar: mismo dia
        this.horariosService.getHorarios(params).subscribe(
          (horariosExistentes) => {
            const conflicto = this.verificarConflicto(solicitud, horariosExistentes);

            if (conflicto) {
              alert(`No se puede aceptar la solicitud. Conflicto detectado: ${conflicto}`);
              this.ejecutarRechazo(solicitud, `Conflicto de horario detectado: ${conflicto}`);
            } else {
              // Proceder a aceptar
              this.solicitudesService.aprobarSolicitud(solicitud.id).subscribe(
                () => {
                  alert('Solicitud aprobada correctamente.');
                  this.cargarSolicitudes();
                },
                (err) => {
                  console.error(err);
                  alert('Error al aprobar la solicitud.');
                  this.isLoading = false;
                }
              );
            }
          },
          (err) => {
            console.error(err);
            this.isLoading = false;
            alert('Error al validar horarios.');
          }
        );
      },
      (err) => {
        console.error(err);
        this.alertarYRechazar(solicitud, 'Error al obtener datos del grupo.');
      }
    );
  }

  private ejecutarRechazo(solicitud: SolicitudCambio, motivo?: string): void {
    this.isLoading = true;
    this.solicitudesService.rechazarSolicitud(solicitud.id).subscribe(
      () => {
        if (motivo) {
          alert(`Solicitud rechazada automáticamente. Motivo: ${motivo}`);
        } else {
          alert('Solicitud rechazada.');
        }
        this.cargarSolicitudes();
      },
      (err) => {
        console.error(err);
        alert('Error al rechazar la solicitud.');
        this.isLoading = false;
      }
    );
  }

  private alertarYRechazar(solicitud: SolicitudCambio, mensaje: string): void {
    alert(mensaje);
    this.ejecutarRechazo(solicitud, mensaje);
  }

  private verificarConflicto(solicitud: SolicitudCambio, horarios: Horario[]): string | null {
    if (!solicitud.hora_inicio_propuesta || !solicitud.hora_fin_propuesta) return "Horas no definidas";

    const inicioSolicitud = this.horaToMinutos(solicitud.hora_inicio_propuesta);
    const finSolicitud = this.horaToMinutos(solicitud.hora_fin_propuesta);

    for (const h of horarios) {
      // Ignorar horarios del mismo grupo (asumimos que es el que se cambia o reemplaza)
      if (h.grupo === solicitud.grupo) continue;

      const inicioH = this.horaToMinutos(h.hora_inicio);
      const finH = this.horaToMinutos(h.hora_fin);

      // Verificar solapamiento de tiempo
      const solapaTiempo = (inicioSolicitud < finH) && (finSolicitud > inicioH);

      if (solapaTiempo) {
        // Verificar Docente
        if (h.docente === solicitud.docente) {
          return `El docente ya tiene otra clase asignada en ese horario (Grupo ${h.grupo}).`;
        }
      }
    }
    return null;
  }

  private horaToMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }
}
