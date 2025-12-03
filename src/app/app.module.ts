import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// Este import es para los servicios HTTP
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Elementos De Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

// Para usar el mask
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

// Cambia el idioma a español
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgChartsModule } from 'ng2-charts';

// Pantallas
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { RegistroScreenComponent } from './screens/registro-screen/registro-screen.component';
import { NavbarComponent } from './partials/navbar/navbar.component';
import { RegistroAdminComponent } from './partials/registro-admin/registro-admin.component';
import { RegistroAlumnosComponent } from './partials/registro-alumnos/registro-alumnos.component';
import { RegistroMaestrosComponent } from './partials/registro-maestros/registro-maestros.component';
import { CambiarContrasenaScreenComponent } from './screens/cambiar-contrasena-screen/cambiar-contrasena-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { LandingPageScreenComponent } from './screens/landing-page-screen/landing-page-screen.component';
import { SidenavComponent } from './partials/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { SolicitudesScreenComponent } from './screens/maestros-screen/solicitudes-screen/solicitudes-screen.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginScreenComponent,
    HomeScreenComponent,
    RegistroScreenComponent,
    NavbarComponent,
    RegistroAdminComponent,
    RegistroAlumnosComponent,
    RegistroMaestrosComponent,
    CambiarContrasenaScreenComponent,
    AdminScreenComponent,
    AlumnosScreenComponent,
    MaestrosScreenComponent,
    LandingPageScreenComponent,
    SidenavComponent,
    SolicitudesScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatRadioModule,
    MatInputModule,
    HttpClientModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaskDirective,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatPaginatorModule,
    NgChartsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideNgxMask()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
