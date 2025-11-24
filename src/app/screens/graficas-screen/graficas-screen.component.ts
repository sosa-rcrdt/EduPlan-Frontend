import { Component, OnInit } from '@angular/core';
import { AdministradoresService } from 'src/app/services/administradores.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{
  //Agregar chartjs-plugin-datalabels
  //Variables
  public total_user: any = {};
  //Histograma
  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data:[89, 34, 43, 54, 28, 74, 93],
        label: 'Registro De Materias Por Día',
        backgroundColor: '#f80606ff'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Desarrollo Web", "Minería de Datos", "Redes", "Móviles", "Matemáticas"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Registro De Alumnos Por Materia',
        backgroundColor: [
          '#FB82F5',
          '#FCFF44',
          '#82D3FB',
          '#F88406',
          '#2AD84A'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[89, 34, 43],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ){}

  ngOnInit(): void {
    this.obtenerTotalUsers();
    console.log("Data: ", this.doughnutChartData);
  }

  public obtenerTotalUsers(){
  this.administradoresServices.getTotalUsuarios().subscribe(
    (response)=>{
      this.total_user = response;
      console.log("Total usuarios: ", this.total_user);

      // EXTRAER VALORES DINÁMICOS
      const admins = this.total_user.admins ?? 0;
      const maestros = this.total_user.maestros ?? 0;
      const alumnos = this.total_user.alumnos ?? 0;

      // ACTUALIZAR PIE
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [
          {
            ...this.pieChartData.datasets[0],
            data: [admins, maestros, alumnos]
          }
        ]
      };

      // ACTUALIZAR DOUGHNUT
      this.doughnutChartData = {
        ...this.doughnutChartData,
        datasets: [
          {
            ...this.doughnutChartData.datasets[0],
            data: [admins, maestros, alumnos]
          }
        ]
      };

    },
    (error)=>{
      alert("No se pudo obtener el total de cada rol de usuarios");
    }
  );
}

}
