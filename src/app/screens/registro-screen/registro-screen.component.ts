import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';
import { Administrador, Alumno, Maestro } from 'src/app/models/usuario.models';

@Component({
  selector: 'app-registro-screen',
  templateUrl: './registro-screen.component.html',
  styleUrls: ['./registro-screen.component.scss'],
})
export class RegistroScreenComponent implements OnInit {
  public tipo: string = 'registro-usuarios';

  public user: any = {};
  public isUpdate: boolean = false;
  public errors: any = {};

  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  public editar: boolean = false;
  public tipo_user: string = '';

  public idUser: number = 0;
  public rol: string = '';

  // New modes for self-editing
  public isSelfEdit: boolean = false;
  public isChangePassword: boolean = false;

  // Password fields for change password mode
  public currentPassword: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private profileService: ProfileService,
    private authService: AuthService,
    private location: Location
) { }

  ngOnInit(): void {
    // Check for query params to determine mode
    this.activatedRoute.queryParams.subscribe((params) => {
      const mode = params['mode'];

      if (mode === 'self-edit') {
        this.isSelfEdit = true;
        this.isChangePassword = false;
        this.editar = true;
        this.isUpdate = true;
        this.loadCurrentUserData();
        return;
      }

      if (mode === 'change-password') {
        this.isChangePassword = true;
        this.isSelfEdit = false;
        this.editar = true;
        this.loadCurrentUserDataForPasswordChange();
        return;
      }

      // Normal flow: check for rol and id in route params
      if (this.activatedRoute.snapshot.params['rol'] !== undefined) {
        this.rol = this.activatedRoute.snapshot.params['rol'];
        console.log('Rol detectado: ', this.rol);
      }

      if (this.activatedRoute.snapshot.params['id'] !== undefined) {
        this.editar = true;
        this.isUpdate = true;
        this.idUser = Number(this.activatedRoute.snapshot.params['id']);
        console.log('ID User: ', this.idUser);
        this.obtenerUserByID();
      } else {
        this.user.tipo_usuario = 'administrador';
        this.isAdmin = true;
        this.isAlumno = false;
        this.isMaestro = false;
        this.tipo_user = 'administrador';
      }
    });
  }

  private loadCurrentUserData(): void {
    this.rol = this.authService.getCurrentRole() || '';

    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        console.log('Profile response:', response);

        // Map the response correctly based on the structure from /profile/me
        this.user = {
          ...response,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          email: response.user.email,
          tipo_usuario: this.rol,
        };

        if (this.rol === 'administrador') {
          this.isAdmin = true;
          this.tipo_user = 'administrador';
        } else if (this.rol === 'maestro') {
          this.isMaestro = true;
          this.tipo_user = 'maestro';
        } else if (this.rol === 'alumno') {
          this.isAlumno = true;
          this.tipo_user = 'alumno';
        }

        console.log('Datos del usuario actual mapeados: ', this.user);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        alert('No se pudieron obtener los datos del usuario');
        this.router.navigate(['/home']);
      },
    });
  }

  private loadCurrentUserDataForPasswordChange(): void {
    this.rol = this.authService.getCurrentRole() || '';
    const profile = this.authService.getCurrentProfile();

    if (profile) {
      const p: any = profile;
      if (p.user) {
        this.user.first_name = p.user.first_name;
        this.user.last_name = p.user.last_name;
      }
    }
  }

  public obtenerUserByID(): void {
    if (this.rol === 'administrador') {
      this.administradoresService.getAdministradorById(this.idUser).subscribe({
        next: (response: Administrador) => {
          this.user = response;
          this.user.first_name = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
          this.tipo_user = 'administrador';
          console.log('Datos admin: ', this.user);
        },
        error: () => {
          alert('No se pudieron obtener los datos del administrador para editar');
        },
      });
    } else if (this.rol === 'maestro') {
      this.maestrosService.getMaestroById(this.idUser).subscribe({
        next: (response: Maestro) => {
          this.user = response;
          this.user.first_name = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.isMaestro = true;
          this.tipo_user = 'maestro';
          console.log('Datos maestro: ', this.user);
        },
        error: () => {
          alert('No se pudieron obtener los datos del maestro para editar');
        },
      });
    } else if (this.rol === 'alumno') {
      console.log('Obteniendo datos de alumno...');
      this.alumnosService.getAlumnoById(this.idUser).subscribe({
        next: (response: Alumno) => {
          this.user = response;
          this.user.first_name = response.user.first_name;
          this.user.last_name = response.user.last_name;
          this.user.email = response.user.email;
          this.user.tipo_usuario = this.rol;
          this.isAlumno = true;
          this.tipo_user = 'alumno';
          console.log('Datos alumno: ', this.user);
        },
        error: () => {
          alert('No se pudieron obtener los datos del alumno para editar');
        },
      });
    }
  }

  public radioChange(event: MatRadioChange): void {
    if (event.value === 'administrador') {
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = 'administrador';
    } else if (event.value === 'alumno') {
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = 'alumno';
    } else if (event.value === 'maestro') {
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = 'maestro';
    }
  }

  public volver(): void {
    this.location.back();
  }


  public submitPasswordChange(): void {
    this.errors = {};

    if (!this.currentPassword) {
      this.errors.current_password = 'La contraseña actual es obligatoria';
    }

    if (!this.newPassword) {
      this.errors.new_password = 'La nueva contraseña es obligatoria';
    }

    if (!this.confirmPassword) {
      this.errors.confirm_password = 'Debe confirmar la nueva contraseña';
    }

    if (this.newPassword && this.newPassword.length < 8) {
      this.errors.new_password = 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (this.newPassword && this.currentPassword && this.newPassword === this.currentPassword) {
      this.errors.new_password = 'La nueva contraseña no puede ser igual a la actual';
    }

    if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
      this.errors.confirm_password = 'La nueva contraseña y su confirmación no coinciden';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const payload = {
      current_password: this.currentPassword,
      new_password: this.newPassword,
      confirm_password: this.confirmPassword,
    };

    this.profileService.changePassword(payload).subscribe({
      next: (response) => {
        alert(response.details || 'Contraseña actualizada correctamente');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        if (error?.error?.details) {
          this.errors.api = error.error.details;
        } else {
          this.errors.api = 'No se pudo cambiar la contraseña';
        }
      },
    });
  }

  public submitSelfEdit(): void {
    this.errors = {};

    const payload: any = {
      first_name: this.user.first_name,
      last_name: this.user.last_name,
    };

    // Add role-specific fields
    if (this.rol === 'administrador') {
      payload.clave_admin = this.user.clave_admin;
      payload.telefono = this.user.telefono;
      payload.rfc = this.user.rfc;
      payload.edad = this.user.edad;
      payload.ocupacion = this.user.ocupacion;
    } else if (this.rol === 'alumno') {
      payload.matricula = this.user.matricula;
      payload.fecha_nacimiento = this.user.fecha_nacimiento;
      payload.carrera = this.user.carrera;
    } else if (this.rol === 'maestro') {
      payload.id_trabajador = this.user.id_trabajador;
      payload.fecha_nacimiento = this.user.fecha_nacimiento;
      payload.telefono = this.user.telefono;
      payload.rfc = this.user.rfc;
      payload.cubiculo = this.user.cubiculo;
      payload.area_investigacion = this.user.area_investigacion;
      payload.materias_json = this.user.materias_json;
    }

    this.profileService.updateProfile(payload).subscribe({
      next: (response) => {
        alert('Datos actualizados correctamente');

        // Update localStorage profile
        this.profileService.getProfile().subscribe({
          next: (updatedProfile) => {
            localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
            this.router.navigate(['/home']);
          },
        });
      },
      error: (error) => {
        if (error?.error?.details) {
          this.errors.api = error.error.details;
        } else {
          this.errors.api = 'No se pudieron actualizar los datos';
        }
      },
    });
  }
}
