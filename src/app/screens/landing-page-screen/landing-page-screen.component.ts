import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ReportesService } from 'src/app/services/reportes.service';
import { PublicSummaryResponse } from 'src/app/shared/models/reportes.models';

@Component({
  selector: 'app-landing-page-screen',
  templateUrl: './landing-page-screen.component.html',
  styleUrls: ['./landing-page-screen.component.scss'],
})
export class LandingPageScreenComponent implements OnInit {
  // Resumen público del backend (/public/summary/)
  summary: PublicSummaryResponse | null = null;
  loading = false;
  error: string | null = null;

  // Gráfica de barras: resumen general del periodo
  barSummaryData: any = {
    labels: ['Grupos con horario', 'Aulas usadas', 'Docentes con horario'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Resumen del periodo',
        backgroundColor: ['#82D3FB', '#F88406', '#31E731'],
      },
    ],
  };

  barSummaryOptions: any = {
    responsive: false,
  };

  barSummaryPlugins = [DatalabelsPlugin];

  // Gráfica doughnut: uso de aulas (usadas vs disponibles)
  doughnutAulasData: any = {
    labels: ['Aulas con horario', 'Aulas disponibles'],
    datasets: [
      {
        data: [0, 0],
        label: 'Uso de aulas',
        backgroundColor: ['#F88406', '#31E7E7'],
      },
    ],
  };

  doughnutAulasOptions: any = {
    responsive: false,
  };

  doughnutAulasPlugins = [DatalabelsPlugin];

  constructor(
    private router: Router,
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarResumenPublico();
  }

  // Navegar a login
  goLogin(): void {
    this.router.navigate(['/']);
  }

  // Navegar a registro
  goRegistro(): void {
    this.router.navigate(['registro-usuarios']);
  }

  // Llama al backend para obtener /public/summary/
  private cargarResumenPublico(): void {
    this.loading = true;
    this.error = null;

    this.reportesService.getPublicSummary().subscribe({
      next: (resp: PublicSummaryResponse | null) => {
        this.loading = false;

        // Si no viene periodo_activo, consideramos que no hay nada que mostrar
        if (!resp || !resp.periodo_activo) {
          this.summary = null;
          return;
        }

        this.summary = resp;
        this.actualizarGraficas(resp);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar el resumen público del sistema.';
      },
    });
  }

  // Actualiza datasets de las gráficas con los valores reales
  private actualizarGraficas(summary: PublicSummaryResponse): void {
    const grupos = summary.total_grupos_con_horario ?? 0;
    const aulasUsadas = summary.total_aulas_usadas ?? 0;
    const docentes = summary.total_docentes_con_horario ?? 0;
    const aulasDisponibles = summary.aulas_disponibles ?? 0;

    // Actualizar barras
    this.barSummaryData = {
      ...this.barSummaryData,
      datasets: [
        {
          ...this.barSummaryData.datasets[0],
          data: [grupos, aulasUsadas, docentes],
        },
      ],
    };

    // Actualizar doughnut de aulas
    this.doughnutAulasData = {
      ...this.doughnutAulasData,
      datasets: [
        {
          ...this.doughnutAulasData.datasets[0],
          data: [aulasUsadas, aulasDisponibles],
        },
      ],
    };
  }
}
