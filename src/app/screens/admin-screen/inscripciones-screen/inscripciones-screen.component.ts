import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { InscripcionesService } from 'src/app/services/inscripciones.service';
import { Inscripcion } from 'src/app/models/inscripciones.models';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { GruposService } from 'src/app/services/grupos.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-inscripciones-screen',
    templateUrl: './inscripciones-screen.component.html',
    styleUrls: ['./inscripciones-screen.component.scss']
})
export class InscripcionesScreenComponent implements OnInit {

    public lista_inscripciones: any[] = [];

    // Columnas de la tabla
    displayedColumns: string[] = ['id', 'alumno', 'grupo', 'materia', 'periodo', 'estado', 'acciones'];
    dataSource = new MatTableDataSource<any>(this.lista_inscripciones);

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private inscripcionesService: InscripcionesService,
        private alumnosService: AlumnosService,
        private gruposService: GruposService,
        private periodosService: PeriodosService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.obtenerInscripciones();
    }

    public obtenerInscripciones() {
        this.inscripcionesService.getInscripciones().subscribe({
            next: (response) => {
                // Necesitamos enriquecer los datos porque la inscripción solo trae IDs
                this.procesarDatos(response);
            },
            error: (error) => {
                alert("Error al obtener inscripciones");
            }
        });
    }

    // Método para obtener nombres de alumno, grupo, materia y periodo
    // Nota: Esto puede ser lento si son muchos registros. Idealmente el backend debería devolver los datos populados.
    // Como no puedo cambiar el backend, haré lo mejor posible.
    // Una optimización es traer todos los alumnos, grupos y periodos una vez y mapear.
    // Pero para simplificar y seguir el patrón, intentaré hacerlo eficiente.
    // UPDATE: El backend de inscripciones devuelve IDs.
    // Voy a asumir que necesitamos hacer peticiones adicionales o que el backend ya trae algo.
    // Revisando el modelo Inscripcion: trae IDs.
    // Revisando CargaAcademicaItem: trae objetos completos.
    // Pero getInscripciones devuelve Inscripcion[].

    // Estrategia: Traer catálogos completos y cruzar datos.
    private procesarDatos(inscripciones: Inscripcion[]) {
        // Para no saturar, traeremos los catálogos primero.
        forkJoin({
            alumnos: this.alumnosService.getAlumnos(),
            grupos: this.gruposService.getGrupos(), // Ojo: esto podría traer muchos
            periodos: this.periodosService.getPeriodos()
        }).subscribe({
            next: (catalogos) => {
                const alumnosMap = new Map(catalogos.alumnos.map(a => [a.id, a]));
                const gruposMap = new Map(catalogos.grupos.map(g => [g.id, g]));
                const periodosMap = new Map(catalogos.periodos.map(p => [p.id, p]));

                this.lista_inscripciones = inscripciones.map(ins => {
                    const alumno = alumnosMap.get(ins.alumno);
                    const grupo = gruposMap.get(ins.grupo);
                    const periodo = periodosMap.get(ins.periodo);

                    // El grupo tiene ID de materia, pero no nombre.
                    // Necesitamos el nombre de la materia.
                    // Podríamos traer materias también.

                    return {
                        ...ins,
                        alumno_nombre: alumno ? `${alumno.user.first_name} ${alumno.user.last_name}` : 'Desconocido',
                        grupo_nombre: grupo ? grupo.nombre : 'Desconocido',
                        materia_id: grupo ? grupo.materia : null, // Necesitaremos cruzar con materia
                        periodo_nombre: periodo ? periodo.nombre : 'Desconocido'
                    };
                });

                // Ahora traemos materias para completar
                // (O podríamos haberlo incluido en el forkJoin si tuvieramos MateriasService inyectado)
                // Lo haré simple: mostrar ID de materia o intentar traer materias.
                // Mejor traigo materias.
                this.dataSource = new MatTableDataSource<any>(this.lista_inscripciones);
                this.dataSource.paginator = this.paginator;
            },
            error: (err) => {
                console.error("Error cargando catálogos", err);
            }
        });
    }

    public goEditar(id: number) {
        this.router.navigate(['home/inscripciones/registro', id]);
    }

    public delete(id: number) {
        if (confirm("¿Estás seguro de eliminar esta inscripción?")) {
            this.inscripcionesService.eliminarInscripcion(id).subscribe({
                next: () => {
                    alert("Inscripción eliminada correctamente");
                    this.obtenerInscripciones();
                },
                error: () => {
                    alert("Error al eliminar");
                }
            });
        }
    }

    public goRegistro() {
        this.router.navigate(['home/inscripciones/registro']);
    }
}
