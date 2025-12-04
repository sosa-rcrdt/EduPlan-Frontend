import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HorariosService } from 'src/app/services/horarios.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MateriasService } from 'src/app/services/materias.service';
import { AulasService } from 'src/app/services/aulas.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlertService } from 'src/app/services/alert.service';
import { HorarioCreateRequest, HorarioUpdateRequest, HorarioEstado, DiaSemana } from 'src/app/shared/models/horarios.models';
import { PeriodoAcademico } from 'src/app/shared/models/periodos.models';
import { Grupo } from 'src/app/shared/models/grupos.models';
import { Materia } from 'src/app/shared/models/materias.models';
import { Aula } from 'src/app/shared/models/aulas.models';
import { Maestro } from 'src/app/shared/models/usuario.models';

@Component({
    selector: 'app-registro-horario-screen',
    templateUrl: './registro-horario-screen.component.html',
    styleUrls: ['./registro-horario-screen.component.scss']
})
export class RegistroHorarioScreenComponent implements OnInit {

    public idHorario: number | null = null;
    public esEdicion: boolean = false;
    public isLoading: boolean = false;
    public isSubmitting: boolean = false;

    public periodos: PeriodoAcademico[] = [];
    public grupos: Grupo[] = [];
    public materias: Materia[] = [];
    public materiasFiltered: Materia[] = []; // Materias filtradas por grupo
    public aulas: Aula[] = [];
    public maestros: Maestro[] = [];

    // Modelo del formulario
    public horario: any = {
        periodo: null,
        grupo: null,
        materia: null,
        aula: null,
        dia_semana: null,
        hora_inicio: '',
        hora_fin: '',
        docente: null,
        estado: 'ACTIVO' as HorarioEstado
    };

    public diasSemana = [
        { value: 0, label: 'Lunes' },
        { value: 1, label: 'Martes' },
        { value: 2, label: 'Miércoles' },
        { value: 3, label: 'Jueves' },
        { value: 4, label: 'Viernes' },
        { value: 5, label: 'Sábado' }
    ];

    public estadosDisponibles: HorarioEstado[] = ['ACTIVO', 'CANCELADO'];
    public errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private horariosService: HorariosService,
        private periodosService: PeriodosService,
        private gruposService: GruposService,
        private materiasService: MateriasService,
        private aulasService: AulasService,
        private maestrosService: MaestrosService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.cargarDatosIniciales();

        // Verificar si hay un ID en la URL
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idHorario = Number(idParam);
            this.esEdicion = true;
            this.cargarHorario(this.idHorario);
        }
    }

    public cargarDatosIniciales(): void {
        this.periodosService.getPeriodos().subscribe(
            (response) => {
                this.periodos = response;
            },
            (error) => {
                console.error("Error al cargar periodos", error);
            }
        );

        this.gruposService.getGrupos().subscribe(
            (response) => {
                this.grupos = response;
            },
            (error) => {
                console.error("Error al cargar grupos", error);
            }
        );

        this.materiasService.getMaterias().subscribe(
            (response) => {
                this.materias = response;
            },
            (error) => {
                console.error("Error al cargar materias", error);
            }
        );

        this.aulasService.getAulas().subscribe(
            (response) => {
                this.aulas = response;
            },
            (error) => {
                console.error("Error al cargar aulas", error);
            }
        );

        this.maestrosService.getMaestros().subscribe(
            (response) => {
                this.maestros = response;
            },
            (error) => {
                console.error("Error al cargar maestros", error);
            }
        );
    }

    // Filtrar materias cuando se selecciona un grupo
    public onGrupoChange(): void {
        if (this.horario.grupo) {
            const grupoId = Number(this.horario.grupo);
            const grupoSeleccionado = this.grupos.find(g => g.id === grupoId);

            if (grupoSeleccionado && grupoSeleccionado.materia) {
                // El grupo tiene asociada UNA materia específica (grupo.materia es el ID)
                // Mostramos solo esa materia
                this.materiasFiltered = this.materias.filter(m => m.id === grupoSeleccionado.materia);

                // Auto-seleccionar la materia si solo hay una
                if (this.materiasFiltered.length === 1) {
                    this.horario.materia = this.materiasFiltered[0].id;
                }
            } else {
                // Si el grupo no tiene materia asignada, mostrar todas
                this.materiasFiltered = this.materias;
            }
        } else {
            this.materiasFiltered = [];
            this.horario.materia = null;
        }
    }

    public cargarHorario(id: number): void {
        this.isLoading = true;
        this.horariosService.getHorarioById(id).subscribe(
            (response) => {
                this.horario = response;
                this.isLoading = false;

                // Trigger materia filtering when editing
                if (this.horario.grupo) {
                    this.onGrupoChange();
                }
            },
            (error) => {
                console.error("Error al cargar horario", error);
                this.errorMessage = "No se pudo cargar la información del horario.";
                this.isLoading = false;
            }
        );
    }

    public onSubmit(): void {
        this.errorMessage = '';

        console.log('Horario data:', this.horario); // Debug

        // Validaciones básicas - Asegurarse que todos los campos requeridos tienen valor
        if (!this.horario.periodo || !this.horario.grupo || !this.horario.materia ||
            !this.horario.aula || this.horario.dia_semana === null ||
            !this.horario.hora_inicio || !this.horario.hora_fin ||
            !this.horario.docente || !this.horario.estado) {
            this.errorMessage = "Por favor completa todos los campos obligatorios.";
            console.log('Validation failed:', {
                periodo: this.horario.periodo,
                grupo: this.horario.grupo,
                materia: this.horario.materia,
                aula: this.horario.aula,
                dia_semana: this.horario.dia_semana,
                hora_inicio: this.horario.hora_inicio,
                hora_fin: this.horario.hora_fin,
                docente: this.horario.docente,
                estado: this.horario.estado
            });
            return;
        }

        this.isSubmitting = true;

        if (this.esEdicion && this.idHorario) {
            this.actualizarHorario();
        } else {
            this.crearHorario();
        }
    }

    private crearHorario(): void {
        const payload: HorarioCreateRequest = {
            periodo: Number(this.horario.periodo),
            grupo: Number(this.horario.grupo),
            aula: Number(this.horario.aula),
            dia_semana: this.horario.dia_semana as DiaSemana,
            hora_inicio: this.horario.hora_inicio,
            hora_fin: this.horario.hora_fin,
            docente: Number(this.horario.docente),
            estado: this.horario.estado
        };

        this.horariosService.crearHorario(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                this.alertService.success("Horario creado correctamente");
                this.router.navigate(['/home']);
            },
            (error) => {
                console.error("Error al crear horario", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al crear el horario. Intenta nuevamente.";
                }
            }
        );
    }

    private actualizarHorario(): void {
        if (!this.idHorario) return;

        const payload: HorarioUpdateRequest = {
            id: this.idHorario,
            periodo: Number(this.horario.periodo),
            grupo: Number(this.horario.grupo),
            aula: Number(this.horario.aula),
            dia_semana: this.horario.dia_semana as DiaSemana,
            hora_inicio: this.horario.hora_inicio,
            hora_fin: this.horario.hora_fin,
            docente: Number(this.horario.docente),
            estado: this.horario.estado
        };

        this.horariosService.actualizarHorario(payload).subscribe(
            (response) => {
                this.isSubmitting = false;
                this.alertService.success("Horario actualizado correctamente");
                this.router.navigate(['/home']);
            },
            (error) => {
                console.error("Error al actualizar horario", error);
                this.isSubmitting = false;
                if (error.error && error.error.details) {
                    this.errorMessage = error.error.details;
                } else {
                    this.errorMessage = "Ocurrió un error al actualizar el horario. Intenta nuevamente.";
                }
            }
        );
    }

    public cancelar(): void {
        this.router.navigate(['/home']);
    }
}
