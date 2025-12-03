import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HorariosService } from 'src/app/services/horarios.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { GruposService } from 'src/app/services/grupos.service';
import { AulasService } from 'src/app/services/aulas.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { HorarioCreateRequest, HorarioUpdateRequest, HorarioEstado, DiaSemana } from 'src/app/models/horarios.models';
import { PeriodoAcademico } from 'src/app/models/periodos.models';
import { Grupo } from 'src/app/models/grupos.models';
import { Aula } from 'src/app/models/aulas.models';
import { Maestro } from 'src/app/models/usuario.models';

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
    public aulas: Aula[] = [];
    public maestros: Maestro[] = [];

    // Modelo del formulario
    public horario: any = {
        periodo: null,
        grupo: null,
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
        private aulasService: AulasService,
        private maestrosService: MaestrosService
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

    public cargarHorario(id: number): void {
        this.isLoading = true;
        this.horariosService.getHorarioById(id).subscribe(
            (response) => {
                this.horario = response;
                this.isLoading = false;
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

        // Validaciones básicas
        if (!this.horario.periodo || !this.horario.grupo || !this.horario.aula ||
            this.horario.dia_semana === null || !this.horario.hora_inicio ||
            !this.horario.hora_fin || !this.horario.docente || !this.horario.estado) {
            this.errorMessage = "Por favor completa todos los campos obligatorios.";
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
                alert("Horario creado correctamente.");
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
                alert("Horario actualizado correctamente.");
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
