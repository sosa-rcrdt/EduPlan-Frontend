import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AulasService } from 'src/app/services/aulas.service';
import { Aula } from 'src/app/models/aulas.models';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-aulas-screen',
    templateUrl: './aulas-screen.component.html',
    styleUrls: ['./aulas-screen.component.scss']
})
export class AulasScreenComponent implements OnInit {

    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;

    public aulas: Aula[] = [];
    public isLoading: boolean = false;
    public idAulaEliminar: number | null = null;

    constructor(
        private aulasService: AulasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.obtenerAulas();
    }

    public obtenerAulas(): void {
        this.isLoading = true;
        this.aulasService.getAulas().subscribe(
            (response) => {
                this.aulas = response;
                this.isLoading = false;
            },
            (error) => {
                console.error("Error al obtener aulas", error);
                this.isLoading = false;
            }
        );
    }

    public irARegistro(): void {
        this.router.navigate(['/home/aulas/registro']);
    }

    public editarAula(id: number): void {
        this.router.navigate(['/home/aulas/registro', id]);
    }

    public confirmarEliminacion(id: number): void {
        this.idAulaEliminar = id;
        this.deleteModal.show();
    }

    public eliminarAula(): void {
        if (this.idAulaEliminar) {
            this.aulasService.eliminarAula(this.idAulaEliminar).subscribe(
                (response) => {
                    this.deleteModal.hide();
                    alert("Aula eliminada correctamente");
                    this.obtenerAulas();
                    this.idAulaEliminar = null;
                },
                (error) => {
                    console.error("Error al eliminar aula", error);
                    this.deleteModal.hide();
                    alert("No se pudo eliminar el aula. Intenta nuevamente.");
                }
            );
        }
    }

    public formatEstado(estado: string): string {
        if (estado === 'DISPONIBLE') return 'Disponible';
        if (estado === 'NO_DISPONIBLE') return 'No Disponible';
        return estado;
    }
}
