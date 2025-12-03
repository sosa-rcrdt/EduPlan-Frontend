import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
import { CambiarContrasenaScreenComponent } from './screens/cambiar-contrasena-screen/cambiar-contrasena-screen.component';
import { LandingPageScreenComponent } from './screens/landing-page-screen/landing-page-screen.component';
import { SolicitudMaestroScreenComponent } from './screens/solicitud-maestro-screen/solicitud-maestro-screen.component';
import { MainLayoutComponent } from './layout/main-layout.component';

const routes: Routes = [
  // Rutas públicas (sin sidenav)
  { path: '', component: LandingPageScreenComponent, pathMatch: 'full' },
  { path: 'login', component: LoginScreenComponent, pathMatch: 'full' },
  { path: 'registro', component: RegistroScreenComponent, pathMatch: 'full' },
  { path: 'cambiar-contrasena', component: CambiarContrasenaScreenComponent, pathMatch: 'full' },

  // Rutas privadas (con sidenav)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeScreenComponent },
      { path: 'solicitud-maestro', component: SolicitudMaestroScreenComponent },
      // Aquí irán las rutas de admin más adelante
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
