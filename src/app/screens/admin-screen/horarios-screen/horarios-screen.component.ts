import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HorariosService } from 'src/app/services/horarios.service';
import { MateriasService } from 'src/app/services/materias.service';
import { GruposService } from 'src/app/services/grupos.service';
import { Horario } from 'src/app/models/horarios.models';
import { Materia } from 'src/app/models/materias.models';
import { Grupo } from 'src/app/models/grupos.models';
import { ConfirmationModalComponent } from 'src/app/modals/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-horarios-screen',
    templateUrl: './horarios-screen.component.html',
    styleUrls: ['./horarios-screen.component.scss']
})
export class HorariosScreenComponent implements OnInit {

    @ViewChild('deleteModal') deleteModal!: ConfirmationModalComponent;

    public horarios: Horario[] = [];
    public materias: Materia[] = [];
    public grupos: Grupo[] = [];
    public isLoading: boolean = false;
    public idHorarioEliminar: number | null = null;

    public diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    constructor(
        private horariosService: HorariosService,
        private materiasService: MateriasService,
        private gruposService: GruposService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.obtenerDatos();
    }

    public obtenerDatos(): void {
        this.isLoading = true;

        // Cargar materias y grupos primero
        this.materiasService.getMaterias().subscribe(
            (materiasResponse) => {
                this.materias = materiasResponse;

                this.gruposService.getGrupos().subscribe(
                    (gruposResponse) => {
                        this.grupos = gruposResponse;

                        // Luego cargar horarios
                        this.horariosService.getHorarios().subscribe(
                            (horariosResponse) => {
                                this.horarios = horariosResponse;
                                this.isLoading = false;
                            },
                            (error) => {
                                console.error("Error al obtener horarios", error);
                                this.isLoading = false;
                            }
                        );
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

    public getNombreMateria(grupoId: number): string {
        const grupo = this.grupos.find(g => g.id === grupoId);
        if (!grupo) return 'Desconocida';

        const materia = this.materias.find(m => m.id === grupo.materia);
        return materia ? materia.nombre : 'Desconocida';
    }

    public getNombreGrupo(grupoId: number): string {
        const grupo = this.grupos.find(g => g.id === grupoId);
        return grupo ? grupo.nombre : 'Desconocido';
    }

    public getDiaSemana(dia: number): string {
        return this.diasSemana[dia] || 'Desconocido';
    }

    public formatEstado(estado: string): string {
        if (estado === 'ACTIVO') return 'Activo';
        if (estado === 'CANCELADO') return 'Cancelado';
        return estado;
    }

    public irARegistro(): void {
        this.router.navigate(['/home/horarios/registro']);
    }

    public editarHorario(id: number): void {
        this.router.navigate(['/home/horarios/registro', id]);
    }

    public confirmarEliminacion(id: number): void {
        this.idHorarioEliminar = id;
        this.deleteModal.show();
    }

    public eliminarHorario(): void {
        if (this.idHorarioEliminar) {
            this.horariosService.eliminarHorario(this.idHorarioEliminar).subscribe(
                (response) => {
                    this.deleteModal.hide();
                    alert("Horario eliminado correctamente");
                    this.obtenerDatos();
                    this.idHorarioEliminar = null;
                },
                (error) => {
                    console.error("Error al eliminar horario", error);
                    this.deleteModal.hide();
                    alert("No se pudo eliminar el horario. Intenta nuevamente.");
                }
            );
        }
    }
}
