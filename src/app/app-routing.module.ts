import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
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
import { RegistroHorarioScreenComponent } from './screens/admin-screen/registro-horario-screen/registro-horario-screen.component';
import { InscripcionesScreenComponent } from './screens/admin-screen/inscripciones-screen/inscripciones-screen.component';
import { RegistroInscripcionScreenComponent } from './screens/admin-screen/inscripciones-screen/registro-inscripcion-screen/registro-inscripcion-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { PeticionesScreenComponent } from './screens/peticiones-screen/peticiones-screen.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/login.guard';
import { RoleGuard } from './shared/guards/role.guard';

const routes: Routes = [
  // Rutas públicas (sin sidenav)
  { path: '', component: LandingPageScreenComponent, pathMatch: 'full' },
  { path: 'login', component: LoginScreenComponent, pathMatch: 'full', canActivate: [LoginGuard] },
  { path: 'registro', component: RegistroScreenComponent, pathMatch: 'full', canActivate: [LoginGuard] },

  // Rutas privadas (con sidenav integrado en home)
  {
    path: 'home',
    component: HomeScreenComponent,
    canActivate: [AuthGuard],
    children: [
      // No default route - home component shows dashboard based on role
      { path: 'solicitudes', component: SolicitudesScreenComponent },

      // Rutas de Admin (aplanadas)
      { path: 'periodos', component: PeriodosScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'periodos/registro', component: RegistroPeriodoScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'periodos/registro/:id', component: RegistroPeriodoScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'materias', component: MateriasScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'materias/registro', component: RegistroMateriaScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'materias/registro/:id', component: RegistroMateriaScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'grupos', component: GruposScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'grupos/registro', component: RegistroGrupoScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'grupos/registro/:id', component: RegistroGrupoScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'aulas', component: AulasScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'aulas/registro', component: RegistroAulaScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'aulas/registro/:id', component: RegistroAulaScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'horarios/registro', component: RegistroHorarioScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'horarios/registro/:id', component: RegistroHorarioScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'inscripciones', component: InscripcionesScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'inscripciones/registro', component: RegistroInscripcionScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'inscripciones/registro/:id', component: RegistroInscripcionScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },

      { path: 'reportes', component: AdminScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
      { path: 'peticiones', component: PeticionesScreenComponent, canActivate: [RoleGuard], data: { expectedRole: 'administrador' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
