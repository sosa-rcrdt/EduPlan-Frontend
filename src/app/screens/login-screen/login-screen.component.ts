import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoginRequest } from 'src/app/shared/models/auth.models';
import { Location } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss'],
})
export class LoginScreenComponent implements OnInit {
  public type: string = 'password';
  public username: string = '';
  public password: string = '';
  public errors: any = {};
  public load: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) { }

  ngOnInit(): void { }

  // Inicia sesión usando AuthService y redirige al home
  public login(): void {
    this.load = true;
    this.errors = {};

    // Validación simple en front
    if (!this.username) {
      this.errors.username = 'El correo es obligatorio';
    }

    if (!this.password) {
      this.errors.password = 'La contraseña es obligatoria';
    }

    if (!$.isEmptyObject(this.errors)) {
      this.load = false;
      return;
    }

    const payload: LoginRequest = {
      username: this.username,
      password: this.password,
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        // AuthService ya guarda tokens, rol y perfil en localStorage
        this.router.navigate(['home']);
        this.load = false;
      },
      error: (error) => {
        this.load = false;
        // Mensaje de error genérico de credenciales
        this.errors.general = 'No se pudo iniciar sesión. Verifique sus credenciales.';
      },
    });
  }

  // Navega a la pantalla de registro
  public registrar(): void {
    this.router.navigate(['registro']);
  }

  // Alterna la visibilidad de la contraseña usando jQuery
  public showPassword(): void {
    if (this.type === 'password') {
      $('#show-password').addClass('show-password');
      $('#show-password').attr('data-password', true);
      this.type = 'text';
    } else if (this.type === 'text') {
      $('#show-password').removeClass('show-password');
      $('#show-password').attr('data-password', false);
      this.type = 'password';
    }
  }

  public volver(): void {
    this.location.back();
  }
}

