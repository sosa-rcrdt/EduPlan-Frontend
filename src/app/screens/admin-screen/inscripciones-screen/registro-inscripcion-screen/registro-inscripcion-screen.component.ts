import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InscripcionesService } from 'src/app/services/inscripciones.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { GruposService } from 'src/app/services/grupos.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { PeriodoAcademico } from 'src/app/models/periodos.models';
import { Materia } from 'src/app/models/materias.models';
import { Grupo } from 'src/app/models/grupos.models';
import { Alumno } from 'src/app/models/usuario.models';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-registro-inscripcion-screen',
    templateUrl: './registro-inscripcion-screen.component.html',
    styleUrls: ['./registro-inscripcion-screen.component.scss']
})
export class RegistroInscripcionScreenComponent implements OnInit {

    public id: number | null = null;
    public editar: boolean = false;
    public form: FormGroup;

    // Catálogos
    public lista_periodos: PeriodoAcademico[] = [];
    public lista_materias: Materia[] = [];
    public lista_grupos: Grupo[] = [];
    public lista_alumnos: Alumno[] = [];

    // Autocomplete
    public filteredAlumnos: Observable<Alumno[]>;
    public alumnoControl = new FormControl();

    constructor(
        private fb: FormBuilder,
        private inscripcionesService: InscripcionesService,
        private periodosService: PeriodosService,
        private materiasService: MateriasService,
        private gruposService: GruposService,
        private alumnosService: AlumnosService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.form = this.fb.group({
            periodo_id: ['', Validators.required],
            materia_id: ['', Validators.required], // Auxiliar para filtrar grupos
            grupo_id: ['', Validators.required],
            alumno_id: ['', Validators.required], // Se llena al seleccionar del autocomplete
            estado: ['ACTIVA'] // Solo visible en edición
        });

        // Inicializar observable de filtro
        this.filteredAlumnos = this.alumnoControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterAlumnos(value || ''))
        );
    }

    ngOnInit(): void {
        this.cargarCatalogos();

        // Detectar si es edición
        if (this.activatedRoute.snapshot.params['id']) {
            this.id = Number(this.activatedRoute.snapshot.params['id']);
            this.editar = true;
            this.cargarDatosInscripcion();
        }
    }

    private cargarCatalogos() {
        // Cargar Periodos
        this.periodosService.getPeriodos().subscribe(data => this.lista_periodos = data);

        // Cargar Materias
        this.materiasService.getMaterias().subscribe(data => this.lista_materias = data);

        // Cargar Alumnos (para autocomplete)
        this.alumnosService.getAlumnos().subscribe(data => {
            this.lista_alumnos = data;
            // Actualizar filtro inicial
            this.alumnoControl.setValue('');
        });
    }

    private _filterAlumnos(value: string | Alumno): Alumno[] {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';

        if (typeof value !== 'string') return this.lista_alumnos; // Si es objeto, mostrar todos o filtrar por ese objeto? Mejor mostrar todos.

        return this.lista_alumnos.filter(alumno => {
            const nombreCompleto = `${alumno.user.first_name} ${alumno.user.last_name} ${alumno.matricula}`.toLowerCase();
            return nombreCompleto.includes(filterValue);
        });
    }

    // Formatear cómo se ve la opción seleccionada
    public displayAlumno(alumno: Alumno): string {
        return alumno && alumno.user ? `${alumno.user.first_name} ${alumno.user.last_name} (${alumno.matricula})` : '';
    }

    // Al seleccionar alumno
    public onAlumnoSelected(event: any) {
        const alumno: Alumno = event.option.value;
        this.form.patchValue({ alumno_id: alumno.id });
    }

    // Al cambiar materia, cargar grupos
    public onMateriaChange(materiaId: number) {
        this.gruposService.getGrupos({ materia_id: materiaId }).subscribe(data => {
            this.lista_grupos = data;
            this.form.patchValue({ grupo_id: '' }); // Reset grupo
        });
    }

    public cargarDatosInscripcion() {
        if (!this.id) return;

        this.inscripcionesService.getInscripcionById(this.id).subscribe(inscripcion => {
            // Necesitamos cargar los grupos de la materia de esta inscripción.
            // Pero la inscripción solo tiene grupo_id.
            // Necesitamos saber la materia del grupo para pre-cargar el dropdown de materia y grupos.

            this.gruposService.getGrupoById(inscripcion.grupo).subscribe(grupo => {
                // Cargar grupos de esa materia
                this.gruposService.getGrupos({ materia_id: grupo.materia }).subscribe(grupos => {
                    this.lista_grupos = grupos;

                    // Buscar el alumno para el autocomplete
                    const alumno = this.lista_alumnos.find(a => a.id === inscripcion.alumno);
                    if (alumno) {
                        this.alumnoControl.setValue(alumno);
                    }

                    // Setear valores del form
                    this.form.patchValue({
                        periodo_id: inscripcion.periodo,
                        materia_id: grupo.materia,
                        grupo_id: inscripcion.grupo,
                        alumno_id: inscripcion.alumno,
                        estado: inscripcion.estado
                    });
                });
            });
        });
    }

    public registrar() {
        if (this.form.invalid) {
            alert("Por favor completa todos los campos requeridos");
            return;
        }

        const data = this.form.value;
        // Eliminar campos auxiliares si es necesario, pero el servicio espera alumno, grupo, periodo.
        // materia_id no se envía.

        const payload = {
            alumno: data.alumno_id,
            grupo: data.grupo_id,
            periodo: data.periodo_id
        };

        this.inscripcionesService.crearInscripcion(payload).subscribe({
            next: () => {
                alert("Inscripción creada correctamente");
                this.router.navigate(['home/inscripciones']);
            },
            error: (err) => {
                alert("Error al crear inscripción");
                console.error(err);
            }
        });
    }

    public actualizar() {
        if (this.form.invalid || !this.id) return;

        const data = this.form.value;

        const payload = {
            id: this.id,
            alumno: data.alumno_id,
            grupo: data.grupo_id,
            periodo: data.periodo_id,
            estado: data.estado
        };

        this.inscripcionesService.actualizarInscripcion(payload).subscribe({
            next: () => {
                alert("Inscripción actualizada correctamente");
                this.router.navigate(['home/inscripciones']);
            },
            error: (err) => {
                alert("Error al actualizar inscripción");
                console.error(err);
            }
        });
    }

    public regresar() {
        this.router.navigate(['home/inscripciones']);
    }
}
