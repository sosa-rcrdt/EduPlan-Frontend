import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
import { CambiarContrasenaScreenComponent } from './screens/cambiar-contrasena-screen/cambiar-contrasena-screen.component';
import { LandingPageScreenComponent } from './screens/landing-page-screen/landing-page-screen.component';
import { SolicitudesScreenComponent } from './screens/maestros-screen/solicitudes-screen/solicitudes-screen.component';
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
      { path: 'periodos', component: AdminScreenComponent }, // Placeholder: Debería ser PeriodosScreenComponent
      { path: 'materias', component: AdminScreenComponent }, // Placeholder: Debería ser MateriasScreenComponent
      { path: 'grupos', component: AdminScreenComponent },   // Placeholder
      { path: 'aulas', component: AdminScreenComponent },    // Placeholder
      { path: 'horarios', component: AdminScreenComponent }, // Placeholder
      { path: 'reportes', component: AdminScreenComponent }, // Placeholder
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
