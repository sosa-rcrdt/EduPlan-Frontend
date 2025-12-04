import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NotificacionesService, Notificacion } from 'src/app/services/notificaciones.service';
import { AuthService } from 'src/app/services/auth.service';

declare var $: any;

@Component({
  selector: 'app-notificaciones-modal',
  templateUrl: './notificaciones-modal.component.html',
  styleUrls: ['./notificaciones-modal.component.scss']
})
export class NotificacionesModalComponent implements OnInit, AfterViewInit, OnDestroy {

  public notificaciones: Notificacion[] = [];
  public isLoading: boolean = false;
  public modalId: string = 'notificacionesModal';

  constructor(
    private notificacionesService: NotificacionesService,
    private authService: AuthService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    document.body.appendChild(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.remove();
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  public show(): void {
    $(`#${this.modalId}`).modal('show');
    this.cargarNotificaciones();
  }

  public hide(): void {
    $(`#${this.modalId}`).modal('hide');
  }

  cargarNotificaciones(): void {
    this.isLoading = true;
    this.notificacionesService.getNotificaciones().subscribe(
      (data) => {
        this.notificaciones = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar notificaciones', error);
        this.isLoading = false;
      }
    );
  }

  eliminarNotificacion(id: number): void {
    this.notificacionesService.eliminarNotificacion(id).subscribe(
      () => {
        // Eliminar localmente para feedback inmediato
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
      },
      (error) => {
        console.error('Error al eliminar notificación', error);
      }
    );
  }

  getIconClass(tipo: string): string {
    switch (tipo) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'error': return 'bi-x-circle-fill text-danger';
      case 'warning': return 'bi-exclamation-triangle-fill text-warning';
      default: return 'bi-info-circle-fill text-primary';
    }
  }
}
