import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
import { CambiarContrasenaScreenComponent } from './screens/cambiar-contrasena-screen/cambiar-contrasena-screen.component';
import { LandingPageScreenComponent } from './screens/landing-page-screen/landing-page-screen.component';

const routes: Routes = [
  //Pantalla principal del login
  { path: '', component: LandingPageScreenComponent, pathMatch: 'full' },
  { path: 'login', component: LoginScreenComponent, pathMatch: 'full'},
  { path: 'registro', component: RegistroScreenComponent, pathMatch: 'full' },
  { path: 'cambiar-contrasena', component: CambiarContrasenaScreenComponent, pathMatch: 'full' },
  { path: 'home', component: HomeScreenComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
