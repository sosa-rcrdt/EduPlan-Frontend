import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';
import { Materia } from 'src/app/shared/models/materias.models';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-materias-screen',
    templateUrl: './materias-screen.component.html',
    styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit {

    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;

    public materias: Materia[] = [];
    public isLoading: boolean = false;
    public idMateriaEliminar: number | null = null;

    constructor(
        private materiasService: MateriasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.obtenerMaterias();
    }

    public obtenerMaterias(): void {
        this.isLoading = true;
        this.materiasService.getMaterias().subscribe(
            (response) => {
                this.materias = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al obtener materias", error);
                this.isLoading = false;
            }
        );
    }

    public irARegistro(): void {
        this.router.navigate(['/home/materias/registro']);
    }

    public editarMateria(id: number): void {
        this.router.navigate(['/home/materias/registro', id]);
    }

    public confirmarEliminacion(id: number): void {
        this.idMateriaEliminar = id;
        this.deleteModal.show();
    }

    public eliminarMateria(): void {
        if (this.idMateriaEliminar) {
            this.materiasService.eliminarMateria(this.idMateriaEliminar).subscribe(
                (response) => {
                    this.deleteModal.hide();
                    alert("Materia eliminada correctamente");
                    this.obtenerMaterias();
                    this.idMateriaEliminar = null;
                },
                (error) => {
                    console.error("Error al eliminar materia", error);
                    this.deleteModal.hide();
                    alert("No se pudo eliminar la materia. Intenta nuevamente.");
                }
            );
        }
    }
}
