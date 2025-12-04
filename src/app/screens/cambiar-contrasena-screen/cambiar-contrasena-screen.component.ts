import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { ChangePasswordRequest } from 'src/app/models/auth.models';

@Component({
  selector: 'app-cambiar-contrasena-screen',
  templateUrl: './cambiar-contrasena-screen.component.html',
  styleUrls: ['./cambiar-contrasena-screen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CambiarContrasenaScreenComponent implements OnInit {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Para mostrar / ocultar contraseñas
  typeCurrent: string = 'password';
  typeNew: string = 'password';
  typeConfirm: string = 'password';

  errors: any = {};
  load: boolean = false;

  constructor(
    private router: Router,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void { }

  // Toggle de visibilidad de campos
  toggleCurrent(): void {
    this.typeCurrent = this.typeCurrent === 'password' ? 'text' : 'password';
  }

  toggleNew(): void {
    this.typeNew = this.typeNew === 'password' ? 'text' : 'password';
  }

  toggleConfirm(): void {
    this.typeConfirm = this.typeConfirm === 'password' ? 'text' : 'password';
  }

  cancelar(): void {
    this.router.navigate(['home']);
  }

  changePassword(): void {
    this.errors = {};

    // Validaciones en front
    if (!this.currentPassword) {
      this.errors.current_password = 'La contraseña actual es obligatoria';
    }

    if (!this.newPassword) {
      this.errors.new_password = 'La nueva contraseña es obligatoria';
    }

    if (!this.confirmPassword) {
      this.errors.confirm_password = 'Debe confirmar la nueva contraseña';
    }

    if (
      this.newPassword &&
      this.newPassword.length < 8
    ) {
      this.errors.new_password = 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (
      this.newPassword &&
      this.currentPassword &&
      this.newPassword === this.currentPassword
    ) {
      this.errors.new_password = 'La nueva contraseña no puede ser igual a la actual';
    }

    if (
      this.newPassword &&
      this.confirmPassword &&
      this.newPassword !== this.confirmPassword
    ) {
      this.errors.confirm_password = 'La nueva contraseña y su confirmación no coinciden';
    }

    // Si hay errores, no llamar al backend
    if (Object.keys(this.errors).length > 0) {
      return;
    }

    const payload: ChangePasswordRequest = {
      current_password: this.currentPassword,
      new_password: this.newPassword,
      confirm_password: this.confirmPassword,
    };

    this.load = true;

    this.profileService.changePassword(payload).subscribe({
      next: (response) => {
        this.load = false;
        alert(response.details || 'Contraseña actualizada correctamente');

        // Limpia el formulario y regresa al home
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        this.router.navigate(['home']);
      },
      error: (error) => {
        this.load = false;

        if (error?.error?.details) {
          this.errors.api = error.error.details;
        } else {
          this.errors.api = 'No se pudo cambiar la contraseña';
        }
      },
    });
  }
}