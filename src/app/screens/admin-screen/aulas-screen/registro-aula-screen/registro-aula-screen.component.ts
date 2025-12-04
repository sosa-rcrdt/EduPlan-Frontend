import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AulasService } from 'src/app/services/aulas.service';
import { AulaCreateRequest, AulaUpdateRequest, AulaEstado } from 'src/app/shared/models/aulas.models';

@Component({
    selector: 'app-registro-aula-screen',
    templateUrl: './registro-aula-screen.component.html',
    styleUrls: ['./registro-aula-screen.component.scss']
})
export class RegistroAulaScreenComponent implements OnInit {

    public idAula: number | null = null;
    public esEdicion: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;

    // Modelo del formulario
    public aula: any = {
        edificio: '',
        numero: '',
        capacidad: null,
        recursos: '',
        estado: 'DISPONIBLE' as AulaEstado
    };

    public estadosDisponibles: AulaEstado[] = ['DISPONIBLE', 'NO_DISPONIBLE'];
    public errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private aulasService: AulasService
    ) { }

    ngOnInit(): void {
        // Verificar si hay un ID en la URL
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idAula = Number(idParam);
            this.esEdicion = true;
            this.cargarAula(this.idAula);
        }
    }

    public cargarAula(id: number): void {
        this.isLoading = true;
        this.aulasService.getAulaById(id).subscribe(
            (response) => {
                this.aula = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al cargar aula", error);
                this.errorMessage = "No se pudo cargar la información del aula.";
                this.isLoading = false;
            }
        );
    }

    public onSubmit(): void {
        this.errorMessage = '';

        // Validaciones básicas
        if (!this.aula.edificio || !this.aula.numero || !this.aula.capacidad || !this.aula.estado) {
            this.errorMessage = "Por favor completa todos los campos obligatorios.";
            return;
        }

        if (this.aula.capacidad <= 0) {
            this.errorMessage = "La capacidad debe ser mayor a 0.";
            return;
        }

        this.isSubmitting = true;

        if (this.esEdicion && this.idAula) {
            this.actualizarAula();
        } else {
            this.crearAula();
        }
    }

    private crearAula(): void {
        const payload: AulaCreateRequest = {
            edificio: this.aula.edificio,
            numero: this.aula.numero,
            capacidad: this.aula.capacidad,
            recursos: this.aula.recursos || null,
            estado: this.aula.estado
        };

        this.aulasService.crearAula(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Aula creada correctamente.");
                this.router.navigate(['/home/aulas']);
            },
            (error) => {
                console.error("Error al crear aula", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al crear el aula. Intenta nuevamente.";
                }
            }
        );
    }

    private actualizarAula(): void {
        if (!this.idAula) return;

        const payload: AulaUpdateRequest = {
            id: this.idAula,
            edificio: this.aula.edificio,
            numero: this.aula.numero,
            capacidad: this.aula.capacidad,
            recursos: this.aula.recursos || null,
            estado: this.aula.estado
        };

        this.aulasService.actualizarAula(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Aula actualizada correctamente.");
                this.router.navigate(['/home/aulas']);
            },
            (error) => {
                console.error("Error al actualizar aula", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al actualizar el aula. Intenta nuevamente.";
                }
            }
        );
    }

    public cancelar(): void {
        this.router.navigate(['/home/aulas']);
    }
}
