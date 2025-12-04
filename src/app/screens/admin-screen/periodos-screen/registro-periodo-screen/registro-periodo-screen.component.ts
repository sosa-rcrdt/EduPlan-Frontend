import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PeriodosService } from 'src/app/services/periodos.service';
import { PeriodoAcademico, PeriodoCreateRequest, PeriodoUpdateRequest } from 'src/app/models/periodos.models';
import { AlertService } from 'src/app/services/alert.service';

@Component({
    selector: 'app-registro-periodo-screen',
    templateUrl: './registro-periodo-screen.component.html',
    styleUrls: ['./registro-periodo-screen.component.scss']
})
export class RegistroPeriodoScreenComponent implements OnInit {

    public idPeriodo: number | null = null;
    public esEdicion: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;

    // Modelo del formulario
    public periodo: any = {
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'INACTIVO' // Valor por defecto
    };

    public errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private periodosService: PeriodosService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        // Verificar si hay un ID en la URL
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idPeriodo = Number(idParam);
            this.esEdicion = true;
            this.cargarPeriodo(this.idPeriodo);
        }
    }

    public cargarPeriodo(id: number): void {
        this.isLoading = true;
        this.periodosService.getPeriodoById(id).subscribe(
            (response) => {
                this.periodo = {
                    ...response,
                    // Asegurar formato YYYY-MM-DD para los inputs date
                    fecha_inicio: response.fecha_inicio ? response.fecha_inicio.split('T')[0] : '',
                    fecha_fin: response.fecha_fin ? response.fecha_fin.split('T')[0] : ''
                };
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al cargar periodo", error);
                this.errorMessage = "No se pudo cargar la información del periodo.";
                this.isLoading = false;
            }
        );
    }

    public onSubmit(): void {
        this.errorMessage = '';

        // Validaciones básicas
        if (!this.periodo.nombre || !this.periodo.fecha_inicio || !this.periodo.fecha_fin) {
            this.errorMessage = "Por favor completa todos los campos obligatorios.";
            return;
        }

        if (this.periodo.fecha_inicio >= this.periodo.fecha_fin) {
            this.errorMessage = "La fecha de inicio debe ser anterior a la fecha de fin.";
            return;
        }

        this.isSubmitting = true;

        if (this.esEdicion && this.idPeriodo) {
            this.actualizarPeriodo();
        } else {
            this.crearPeriodo();
        }
    }

    private crearPeriodo(): void {
        const payload: PeriodoCreateRequest = {
            nombre: this.periodo.nombre,
            fecha_inicio: this.periodo.fecha_inicio,
            fecha_fin: this.periodo.fecha_fin,
            estado: this.periodo.estado
        };

        this.periodosService.crearPeriodo(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                this.alertService.success("Periodo creado correctamente");
                this.router.navigate(['/home/periodos']);
            },
            (error) => {
                console.error("Error al crear periodo", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al crear el periodo. Intenta nuevamente.";
                }
            }
        );
    }

    private actualizarPeriodo(): void {
        if (!this.idPeriodo) return;

        const payload: PeriodoUpdateRequest = {
            id: this.idPeriodo,
            nombre: this.periodo.nombre,
            fecha_inicio: this.periodo.fecha_inicio,
            fecha_fin: this.periodo.fecha_fin,
            estado: this.periodo.estado
        };

        this.periodosService.actualizarPeriodo(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                this.alertService.success("Periodo actualizado correctamente");
                this.router.navigate(['/home/periodos']);
            },
            (error) => {
                console.error("Error al actualizar periodo", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al actualizar el periodo. Intenta nuevamente.";
                }
            }
        );
    }

    public cancelar(): void {
        this.router.navigate(['/home/periodos']);
    }
}
