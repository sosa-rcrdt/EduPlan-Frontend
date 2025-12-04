import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodosService } from 'src/app/services/periodos.service';
import { PeriodoAcademico } from 'src/app/models/periodos.models';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';
import { AlertService } from 'src/app/services/alert.service';

@Component({
    selector: 'app-periodos-screen',
    templateUrl: './periodos-screen.component.html',
    styleUrls: ['./periodos-screen.component.scss']
})
export class PeriodosScreenComponent implements OnInit {

    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;

    public periodos: PeriodoAcademico[] = [];
    public isLoading: boolean = false;
    public idPeriodoEliminar: number | null = null;

    constructor(
        private periodosService: PeriodosService,
        private router: Router,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.obtenerPeriodos();
    }

    public obtenerPeriodos(): void {
        this.isLoading = true;
        this.periodosService.getPeriodos().subscribe(
            (response) => {
                this.periodos = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al obtener periodos", error);
                this.isLoading = false;
            }
        );
    }

    public irARegistro(): void {
        this.router.navigate(['/home/periodos/registro']);
    }

    public editarPeriodo(id: number): void {
        this.router.navigate(['/home/periodos/registro', id]);
    }

    public confirmarEliminacion(id: number): void {
        this.idPeriodoEliminar = id;
        this.deleteModal.show();
    }

    public eliminarPeriodo(): void {
        if (this.idPeriodoEliminar) {
            this.periodosService.eliminarPeriodo(this.idPeriodoEliminar).subscribe(
                (response) => {
                    this.deleteModal.hide();
                    this.alertService.success("Periodo eliminado correctamente");
                    this.obtenerPeriodos();
                    this.idPeriodoEliminar = null;
                },
                (error) => {
                    console.error("Error al eliminar periodo", error);
                    this.deleteModal.hide();
                    this.alertService.error("No se pudo eliminar el periodo. Intenta nuevamente");
                }
            );
        }
    }
}
