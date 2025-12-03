import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { GrupoCreateRequest, GrupoUpdateRequest } from 'src/app/models/grupos.models';
import { Materia } from 'src/app/models/materias.models';

@Component({
    selector: 'app-registro-grupo-screen',
    templateUrl: './registro-grupo-screen.component.html',
    styleUrls: ['./registro-grupo-screen.component.scss']
})
export class RegistroGrupoScreenComponent implements OnInit {

    public idGrupo: number | null = null;
    public esEdicion: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;
    public materias: Materia[] = [];

    // Modelo del formulario
    public grupo: any = {
        nombre: '',
        semestre: null,
        materia: null, // ID de la materia
        cupo_maximo: null
    };

    public errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private gruposService: GruposService,
        private materiasService: MateriasService
    ) { }

    ngOnInit(): void {
        this.cargarMaterias();

        // Verificar si hay un ID en la URL
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idGrupo = Number(idParam);
            this.esEdicion = true;
            this.cargarGrupo(this.idGrupo);
        }
    }

    public cargarMaterias(): void {
        this.materiasService.getMaterias().subscribe(
            (response) => {
                this.materias = response;
            },
            (error) => {
                console.error("Error al cargar materias", error);
            }
        );
    }

    public cargarGrupo(id: number): void {
        this.isLoading = true;
        this.gruposService.getGrupoById(id).subscribe(
            (response) => {
                this.grupo = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al cargar grupo", error);
                this.errorMessage = "No se pudo cargar la información del grupo.";
                this.isLoading = false;
            }
        );
    }

    public onSubmit(): void {
        this.errorMessage = '';

        // Validaciones básicas
        if (!this.grupo.nombre || !this.grupo.semestre || !this.grupo.materia || !this.grupo.cupo_maximo) {
            this.errorMessage = "Por favor completa todos los campos obligatorios.";
            return;
        }

        if (this.grupo.cupo_maximo <= 0) {
            this.errorMessage = "El cupo máximo debe ser mayor a 0.";
            return;
        }

        this.isSubmitting = true;

        if (this.esEdicion && this.idGrupo) {
            this.actualizarGrupo();
        } else {
            this.crearGrupo();
        }
    }

    private crearGrupo(): void {
        const payload: GrupoCreateRequest = {
            nombre: this.grupo.nombre,
            semestre: this.grupo.semestre,
            materia: Number(this.grupo.materia),
            cupo_maximo: this.grupo.cupo_maximo
        };

        this.gruposService.crearGrupo(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Grupo creado correctamente.");
                this.router.navigate(['/home/grupos']);
            },
            (error) => {
                console.error("Error al crear grupo", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al crear el grupo. Intenta nuevamente.";
                }
            }
        );
    }

    private actualizarGrupo(): void {
        if (!this.idGrupo) return;

        const payload: GrupoUpdateRequest = {
            id: this.idGrupo,
            nombre: this.grupo.nombre,
            semestre: this.grupo.semestre,
            materia: Number(this.grupo.materia),
            cupo_maximo: this.grupo.cupo_maximo
        };

        this.gruposService.actualizarGrupo(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                alert("Grupo actualizado correctamente.");
                this.router.navigate(['/home/grupos']);
            },
            (error) => {
                console.error("Error al actualizar grupo", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al actualizar el grupo. Intenta nuevamente.";
                }
            }
        );
    }

    public cancelar(): void {
        this.router.navigate(['/home/grupos']);
    }
}
