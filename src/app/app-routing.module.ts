import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
import { CambiarContrasenaScreenComponent } from './screens/cambiar-contrasena-screen/cambiar-contrasena-screen.component';
import { LandingPageScreenComponent } from './screens/landing-page-screen/landing-page-screen.component';
import { SolicitudesScreenComponent } from './screens/maestros-screen/solicitudes-screen/solicitudes-screen.component';
import { PeriodosScreenComponent } from './screens/admin-screen/periodos-screen/periodos-screen.component';
import { RegistroPeriodoScreenComponent } from './screens/admin-screen/periodos-screen/registro-periodo-screen/registro-periodo-screen.component';
import { MateriasScreenComponent } from './screens/admin-screen/materias-screen/materias-screen.component';
import { RegistroMateriaScreenComponent } from './screens/admin-screen/materias-screen/registro-materia-screen/registro-materia-screen.component';
import { GruposScreenComponent } from './screens/admin-screen/grupos-screen/grupos-screen.component';
import { RegistroGrupoScreenComponent } from './screens/admin-screen/grupos-screen/registro-grupo-screen/registro-grupo-screen.component';
import { AulasScreenComponent } from './screens/admin-screen/aulas-screen/aulas-screen.component';
import { RegistroAulaScreenComponent } from './screens/admin-screen/aulas-screen/registro-aula-screen/registro-aula-screen.component';
import { HorariosScreenComponent } from './screens/admin-screen/horarios-screen/horarios-screen.component';
import { RegistroHorarioScreenComponent } from './screens/admin-screen/horarios-screen/registro-horario-screen/registro-horario-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component'; // Importar si se usa directamente
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component'; // Importar si se usa directamente
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component'; // Importar si se usa directamente

const routes: Routes = [
  // Rutas públicas (sin sidenav)
  { path: '', component: LandingPageScreenComponent, pathMatch: 'full' },
  { path: 'login', component: LoginScreenComponent, pathMatch: 'full' },
  { path: 'registro', component: RegistroScreenComponent, pathMatch: 'full' },
  { path: 'cambiar-contrasena', component: CambiarContrasenaScreenComponent, pathMatch: 'full' },

  // Rutas privadas (con sidenav integrado en home)
  {
    path: 'home',
    component: HomeScreenComponent,
    children: [
      { path: '', component: AdminScreenComponent }, // Dashboard principal (muestra según rol)
      { path: 'solicitudes', component: SolicitudesScreenComponent },

      // Rutas de Admin (aplanadas)
      { path: 'periodos', component: PeriodosScreenComponent },
      { path: 'periodos/registro', component: RegistroPeriodoScreenComponent },
      { path: 'periodos/registro/:id', component: RegistroPeriodoScreenComponent },

      { path: 'materias', component: MateriasScreenComponent },
      { path: 'materias/registro', component: RegistroMateriaScreenComponent },
      { path: 'materias/registro/:id', component: RegistroMateriaScreenComponent },

      { path: 'grupos', component: GruposScreenComponent },
      { path: 'grupos/registro', component: RegistroGrupoScreenComponent },
      { path: 'grupos/registro/:id', component: RegistroGrupoScreenComponent },

      { path: 'aulas', component: AulasScreenComponent },
      { path: 'aulas/registro', component: RegistroAulaScreenComponent },
      { path: 'aulas/registro/:id', component: RegistroAulaScreenComponent },

      { path: 'horarios', component: HorariosScreenComponent }, // Placeholder
      { path: 'horarios/registro', component: RegistroHorarioScreenComponent }, // Placeholder
      { path: 'horarios/registro/:id', component: RegistroHorarioScreenComponent }, // Placeholder
      { path: 'reportes', component: AdminScreenComponent }, // Placeholder
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
