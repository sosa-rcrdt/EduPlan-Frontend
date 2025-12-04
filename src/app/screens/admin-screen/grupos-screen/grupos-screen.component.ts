import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { Grupo } from 'src/app/models/grupos.models';
import { Materia } from 'src/app/models/materias.models';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-grupos-screen',
    templateUrl: './grupos-screen.component.html',
    styleUrls: ['./grupos-screen.component.scss']
})
export class GruposScreenComponent implements OnInit {

    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;

    public grupos: Grupo[] = [];
    public materias: Materia[] = [];
    public isLoading: boolean = false;
    public idGrupoEliminar: number | null = null;

    constructor(
        private gruposService: GruposService,
        private materiasService: MateriasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.obtenerDatos();
    }

    public obtenerDatos(): void {
        this.isLoading = true;
        // Obtener materias primero para mapear nombres
        this.materiasService.getMaterias().subscribe(
            (materiasResponse) => {
                this.materias = materiasResponse;
                // Luego obtener grupos
                this.gruposService.getGrupos().subscribe(
                    (gruposResponse) => {
                        this.grupos = gruposResponse;
                        this.isLoading = false;
                    },
                    (error) => {
                        console.error("Error al obtener grupos", error);
                        this.isLoading = false;
                    }
                );
            },
            (error) => {
                console.error("Error al obtener materias", error);
                this.isLoading = false;
            }
        );
    }

    public getNombreMateria(id: number): string {
        const materia = this.materias.find(m => m.id === id);
        return materia ? materia.nombre : 'Desconocida';
    }

    public irARegistro(): void {
        this.router.navigate(['/home/grupos/registro']);
    }

    public editarGrupo(id: number): void {
        this.router.navigate(['/home/grupos/registro', id]);
    }

    public confirmarEliminacion(id: number): void {
        this.idGrupoEliminar = id;
        this.deleteModal.show();
    }

    public eliminarGrupo(): void {
        if (this.idGrupoEliminar) {
            this.gruposService.eliminarGrupo(this.idGrupoEliminar).subscribe(
                (response) => {
                    this.deleteModal.hide();
                    alert("Grupo eliminado correctamente");
                    this.obtenerDatos();
                    this.idGrupoEliminar = null;
                },
                (error) => {
                    console.error("Error al eliminar grupo", error);
                    this.deleteModal.hide();
                    alert("No se pudo eliminar el grupo. Intenta nuevamente.");
                }
            );
        }
    }
}
