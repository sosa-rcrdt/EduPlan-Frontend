import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ReportesService } from 'src/app/services/reportes.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { GruposService } from 'src/app/services/grupos.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { PeriodoAcademico } from 'src/app/shared/models/periodos.models';

@Component({
    selector: 'app-reportes-screen',
    templateUrl: './reportes-screen.component.html',
    styleUrls: ['./reportes-screen.component.scss']
})
export class ReportesScreenComponent implements OnInit {

    public lista_periodos: PeriodoAcademico[] = [];
    public periodo_seleccionado: number | null = null;
    public isLoading: boolean = false;

    @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

    // Chart 1: Uso de Aulas
    public aulasChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
            legend: { display: true, position: 'top' },
            title: { display: true, text: 'Uso de Aulas - Horas Totales por Semana', font: { size: 16 } }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Horas Semanales' }
            }
        }
    };
    public aulasChartType: ChartType = 'bar';
    public aulasChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Horas Ocupadas', backgroundColor: '#42A5F5', borderColor: '#1976D2', borderWidth: 1 }
        ]
    };

    // Chart 2: Carga Docente
    public docenteChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
            legend: { display: true, position: 'top' },
            title: { display: true, text: 'Carga Académica por Docente', font: { size: 16 } }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Cantidad' }
            }
        }
    };
    public docenteChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Grupos Asignados', backgroundColor: '#66BB6A', borderColor: '#388E3C', borderWidth: 1 },
            { data: [], label: 'Horas Semanales', backgroundColor: '#FFA726', borderColor: '#F57C00', borderWidth: 1 }
        ]
    };

    // Chart 3: Horarios por Grupo
    public grupoChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
            legend: { display: true, position: 'top' },
            title: { display: true, text: 'Horas Asignadas por Grupo (Top 10)', font: { size: 16 } }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Horas Semanales' }
            }
        }
    };
    public grupoChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Horas Semanales', backgroundColor: '#AB47BC', borderColor: '#7B1FA2', borderWidth: 1 }
        ]
    };

    // Chart 4: Resumen del Período
    public periodoChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.8,
        plugins: {
            legend: { position: 'right' },
            title: { display: true, text: 'Distribución del Período', font: { size: 16 } }
        }
    };
    public periodoChartType: ChartType = 'doughnut';
    public periodoChartData: ChartData<'doughnut'> = {
        labels: ['Grupos Activos', 'Docentes Asignados', 'Aulas en Uso'],
        datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
            borderColor: ['#1976D2', '#388E3C', '#F57C00'],
            borderWidth: 2
        }]
    };

    constructor(
        private reportesService: ReportesService,
        private periodosService: PeriodosService,
        private gruposService: GruposService,
        private horariosService: HorariosService
    ) { }

    ngOnInit(): void {
        this.cargarPeriodos();
    }

    private cargarPeriodos() {
        this.periodosService.getPeriodos().subscribe({
            next: (data) => {
                this.lista_periodos = data;
                const activo = data.find(p => p.estado === 'ACTIVO');
                if (activo) {
                    this.periodo_seleccionado = activo.id;
                } else if (data.length > 0) {
                    this.periodo_seleccionado = data[0].id;
                }

                if (this.periodo_seleccionado) {
                    this.cargarReportes();
                }
            },
            error: (err) => console.error("Error cargando periodos", err)
        });
    }

    public onPeriodoChange() {
        if (this.periodo_seleccionado) {
            this.cargarReportes();
        }
    }

    private cargarReportes() {
        if (!this.periodo_seleccionado) return;

        this.isLoading = true;
        this.resetCharts();

        // 1. Uso de Aulas
        this.reportesService.getReporteUsoAulas({ periodo_id: this.periodo_seleccionado }).subscribe({
            next: (data) => {
                this.aulasChartData = {
                    labels: data.map(item => item.aula),
                    datasets: [{
                        data: data.map(item => item.total_horas),
                        label: 'Horas Ocupadas',
                        backgroundColor: '#42A5F5',
                        borderColor: '#1976D2',
                        borderWidth: 1
                    }]
                };
                this.updateCharts();
            },
            error: (err) => console.error("Error cargando uso de aulas", err)
        });

        // 2. Carga Docente
        this.reportesService.getReporteCargaDocente({ periodo_id: this.periodo_seleccionado }).subscribe({
            next: (data) => {
                this.docenteChartData = {
                    labels: data.map(item => item.docente),
                    datasets: [
                        {
                            data: data.map(item => item.num_grupos),
                            label: 'Grupos Asignados',
                            backgroundColor: '#66BB6A',
                            borderColor: '#388E3C',
                            borderWidth: 1
                        },
                        {
                            data: data.map(item => item.total_horas),
                            label: 'Horas Semanales',
                            backgroundColor: '#FFA726',
                            borderColor: '#F57C00',
                            borderWidth: 1
                        }
                    ]
                };
                this.updateCharts();
            },
            error: (err) => console.error("Error cargando carga docente", err)
        });

        // 3. Horarios por Grupo
        this.gruposService.getGrupos().subscribe({
            next: (grupos) => {
                this.horariosService.getHorarios({ periodo_id: this.periodo_seleccionado! }).subscribe({
                    next: (horarios) => {
                        const horasPorGrupo = new Map<number, { nombre: string, horas: number }>();

                        horarios.forEach(h => {
                            if (h.estado === 'ACTIVO') {
                                const grupo = grupos.find(g => g.id === h.grupo);
                                if (grupo) {
                                    const inicio = this.horaToMinutos(h.hora_inicio);
                                    const fin = this.horaToMinutos(h.hora_fin);
                                    const duracion = (fin - inicio) / 60;

                                    if (horasPorGrupo.has(h.grupo)) {
                                        horasPorGrupo.get(h.grupo)!.horas += duracion;
                                    } else {
                                        horasPorGrupo.set(h.grupo, { nombre: grupo.nombre, horas: duracion });
                                    }
                                }
                            }
                        });

                        const gruposOrdenados = Array.from(horasPorGrupo.values())
                            .sort((a, b) => b.horas - a.horas)
                            .slice(0, 10);

                        this.grupoChartData = {
                            labels: gruposOrdenados.map(g => g.nombre),
                            datasets: [{
                                data: gruposOrdenados.map(g => g.horas),
                                label: 'Horas Semanales',
                                backgroundColor: '#AB47BC',
                                borderColor: '#7B1FA2',
                                borderWidth: 1
                            }]
                        };
                        this.updateCharts();
                    }
                });
            },
            error: (err) => console.error("Error cargando grupos", err)
        });

        // 4. Resumen del Período
        this.reportesService.getReportePeriodoResumen(this.periodo_seleccionado).subscribe({
            next: (data) => {
                this.periodoChartData = {
                    labels: ['Grupos Activos', 'Docentes Asignados', 'Aulas en Uso'],
                    datasets: [{
                        data: [
                            data.total_grupos,
                            data.total_docentes,
                            data.total_aulas_usadas
                        ],
                        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
                        borderColor: ['#1976D2', '#388E3C', '#F57C00'],
                        borderWidth: 2
                    }]
                };
                this.updateCharts();
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error cargando resumen del periodo", err);
                this.isLoading = false;
            }
        });
    }

    private resetCharts() {
        this.aulasChartData = {
            labels: [],
            datasets: [{ data: [], label: 'Horas Ocupadas', backgroundColor: '#42A5F5', borderColor: '#1976D2', borderWidth: 1 }]
        };

        this.docenteChartData = {
            labels: [],
            datasets: [
                { data: [], label: 'Grupos Asignados', backgroundColor: '#66BB6A', borderColor: '#388E3C', borderWidth: 1 },
                { data: [], label: 'Horas Semanales', backgroundColor: '#FFA726', borderColor: '#F57C00', borderWidth: 1 }
            ]
        };

        this.grupoChartData = {
            labels: [],
            datasets: [{ data: [], label: 'Horas Semanales', backgroundColor: '#AB47BC', borderColor: '#7B1FA2', borderWidth: 1 }]
        };

        this.periodoChartData = {
            labels: ['Grupos Activos', 'Docentes Asignados', 'Aulas en Uso'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
                borderColor: ['#1976D2', '#388E3C', '#F57C00'],
                borderWidth: 2
            }]
        };
    }

    private updateCharts() {
        this.charts?.forEach(child => {
            child.update();
        });
    }

    private horaToMinutos(hora: string): number {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }
}
