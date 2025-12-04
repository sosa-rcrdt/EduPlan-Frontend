import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ReportesService } from 'src/app/services/reportes.service';
import { PeriodosService } from 'src/app/services/periodos.service';
import { PeriodoAcademico } from 'src/app/shared/models/periodos.models';
import { GruposService } from 'src/app/services/grupos.service';

@Component({
    selector: 'app-reportes-screen',
    templateUrl: './reportes-screen.component.html',
    styleUrls: ['./reportes-screen.component.scss']
})
export class ReportesScreenComponent implements OnInit {

    public lista_periodos: PeriodoAcademico[] = [];
    public periodo_seleccionado: number | null = null;

    // Acceder a todas las gráficas para actualizarlas
    @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

    // --- Chart 1: Uso de Aulas (Bar) ---
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: { display: true },
            title: { display: true, text: 'Uso de Aulas (Horas Totales)' }
        }
    };
    public barChartType: ChartType = 'bar';
    public barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Horas Ocupadas', backgroundColor: '#42A5F5' }
        ]
    };

    // --- Chart 2: Carga Docente (Bar) ---
    public docenteChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: { display: true },
            title: { display: true, text: 'Carga Docente (Horas Totales)' }
        }
    };
    public docenteChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Horas Asignadas', backgroundColor: '#66BB6A' }
        ]
    };

    // --- Chart 3: Por Grupo (Bar - Horas Totales) ---
    public grupoChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: { display: true },
            title: { display: true, text: 'Horas Totales por Grupo' }
        }
    };
    public grupoChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Horas Semanales', backgroundColor: '#FFA726' }
        ]
    };

    // --- Chart 4: Resumen Periodo (Pie) ---
    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Resumen del Periodo' }
        }
    };
    public pieChartType: ChartType = 'pie';
    public pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: ['Grupos', 'Docentes', 'Aulas Usadas'],
        datasets: [{ data: [0, 0, 0] }]
    };

    constructor(
        private reportesService: ReportesService,
        private periodosService: PeriodosService,
        private gruposService: GruposService
    ) { }

    ngOnInit(): void {
        this.cargarPeriodos();
    }

    private cargarPeriodos() {
        this.periodosService.getPeriodos().subscribe({
            next: (data) => {
                this.lista_periodos = data;
                // Seleccionar el activo por defecto, o el último
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

        // Reset all chart data first to ensure clean updates
        this.barChartData = {
            labels: [],
            datasets: [{ data: [], label: 'Horas Ocupadas', backgroundColor: '#42A5F5' }]
        };

        this.docenteChartData = {
            labels: [],
            datasets: [{ data: [], label: 'Horas Asignadas', backgroundColor: '#66BB6A' }]
        };

        this.grupoChartData = {
            labels: [],
            datasets: [{ data: [], label: 'Horas Semanales', backgroundColor: '#FFA726' }]
        };

        this.pieChartData = {
            labels: ['Grupos', 'Docentes', 'Aulas Usadas'],
            datasets: [{ data: [0, 0, 0] }]
        };

        // 1. Uso de Aulas
        this.reportesService.getReporteUsoAulas({ periodo_id: this.periodo_seleccionado }).subscribe({
            next: (data) => {
                this.barChartData = {
                    labels: data.map(item => item.aula),
                    datasets: [{
                        data: data.map(item => item.total_horas),
                        label: 'Horas Ocupadas',
                        backgroundColor: '#42A5F5'
                    }]
                };
                this.updateCharts();
            }
        });

        // 2. Carga Docente
        this.reportesService.getReporteCargaDocente({ periodo_id: this.periodo_seleccionado }).subscribe({
            next: (data) => {
                this.docenteChartData = {
                    labels: data.map(item => item.docente),
                    datasets: [{
                        data: data.map(item => item.total_horas),
                        label: 'Horas Asignadas',
                        backgroundColor: '#66BB6A'
                    }]
                };
                this.updateCharts();
            }
        });

        // 3. Por Grupo
        this.gruposService.getGrupos().subscribe({
            next: (grupos) => {
                const topGrupos = grupos.slice(0, 10);
                this.grupoChartData = {
                    labels: topGrupos.map(g => g.nombre),
                    datasets: [{
                        data: topGrupos.map(g => g.cupo_maximo),
                        label: 'Cupo Máximo',
                        backgroundColor: '#FFA726'
                    }]
                };
                this.updateCharts();
            }
        });

        // 4. Resumen Periodo
        this.reportesService.getReportePeriodoResumen(this.periodo_seleccionado).subscribe({
            next: (data) => {
                this.pieChartData = {
                    labels: ['Grupos', 'Docentes', 'Aulas Usadas'],
                    datasets: [{
                        data: [
                            data.total_grupos,
                            data.total_docentes,
                            data.total_aulas_usadas
                        ]
                    }]
                };
                this.updateCharts();
            }
        });
    }

    private updateCharts() {
        this.charts?.forEach(child => {
            child.update();
        });
    }
}
