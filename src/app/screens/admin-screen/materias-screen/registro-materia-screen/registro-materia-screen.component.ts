import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';
import { MateriaCreateRequest, MateriaUpdateRequest } from 'src/app/models/materias.models';

@Component({
    selector: 'app-registro-materia-screen',
    templateUrl: './registro-materia-screen.component.html',
    styleUrls: ['./registro-materia-screen.component.scss']
})
export class RegistroMateriaScreenComponent implements OnInit {

    public idMateria: number | null = null;
    public esEdicion: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;

    // Modelo del formulario
    public materia: any = {
        nombre: '',
        codigo: '',
        creditos: 0,
        area_academica: ''
    };

    public errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private materiasService: MateriasService
    ) { }

    ngOnInit(): void {
        // Verificar si hay un ID en la URL
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idMateria = Number(idParam);
            this.esEdicion = true;
            this.cargarMateria(this.idMateria);
        }
    }

    public cargarMateria(id: number): void {
        this.isLoading = true;
        this.materiasService.getMateriaById(id).subscribe(
            (response) => {
                this.materia = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al cargar materia", error);
                this.errorMessage = "No se pudo cargar la información de la materia.";
                this.isLoading = false;
            }
        );
    }

    public onSubmit(): void {
        this.errorMessage = '';

        // Validaciones básicas
        if (!this.materia.nombre || !this.materia.codigo || !this.materia.area_academica || this.materia.creditos <= 0) {
            this.errorMessage = "Por favor completa todos los campos obligatorios y asegúrate que los créditos sean mayores a 0.";
            return;
        }

        this.isSubmitting = true;

        if (this.esEdicion && this.idMateria) {
            this.actualizarMateria();
        } else {
            this.crearMateria();
        }
    }

    private crearMateria(): void {
        const payload: MateriaCreateRequest = {
            nombre: this.materia.nombre,
            codigo: this.materia.codigo,
            creditos: this.materia.creditos,
            area_academica: this.materia.area_academica
        };

        this.materiasService.crearMateria(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Materia creada correctamente.");
                this.router.navigate(['/home/materias']);
            },
            (error) => {
                console.error("Error al crear materia", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al crear la materia. Intenta nuevamente.";
                }
            }
        );
    }

    private actualizarMateria(): void {
        if (!this.idMateria) return;

        const payload: MateriaUpdateRequest = {
            id: this.idMateria,
            nombre: this.materia.nombre,
            codigo: this.materia.codigo,
            creditos: this.materia.creditos,
            area_academica: this.materia.area_academica
        };

        this.materiasService.actualizarMateria(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Materia actualizada correctamente.");
                this.router.navigate(['/home/materias']);
            },
            (error) => {
                console.error("Error al actualizar materia", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al actualizar la materia. Intenta nuevamente.";
                }
            }
        );
    }

    public cancelar(): void {
        this.router.navigate(['/home/materias']);
    }
}
