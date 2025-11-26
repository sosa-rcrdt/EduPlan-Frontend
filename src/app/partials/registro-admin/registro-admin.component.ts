import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { AdministradoresService } from 'src/app/services/administradores.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss'],
})
export class RegistroAdminComponent implements OnInit {
  @Input() rol: string = '';        // 'administrador' desde el registro-screen
  @Input() datos_user: any = {};    // datos precargados cuando se edita

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public admin: any = {};
  public token: string = '';
  public errors: any = {};
  public editar: boolean = false;
  public idUser: number = 0;

  constructor(
    private administradoresService: AdministradoresService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si viene un id en la URL, es edición
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      this.idUser = Number(this.activatedRoute.snapshot.params['id']);
      // Se usan los datos que ya se cargaron en registro-screen (datos_user)
      this.admin = { ...this.datos_user };
    } else {
      // Alta nueva: esquema vacío básico
      this.admin = {
        clave_admin: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmar_password: '',
        telefono: '',
        rfc: '',
        edad: '',
        ocupacion: '',
        rol: this.rol || 'administrador',
      };
    }

    this.token = this.authService.getAccessToken() || '';
    console.log('Admin (form): ', this.admin);
  }

  // Muestra/oculta la contraseña principal
  public showPassword(): void {
    if (this.inputType_1 === 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  // Muestra/oculta la confirmación de contraseña
  public showPwdConfirmar(): void {
    if (this.inputType_2 === 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(): void {
    this.location.back();
  }

  // Registrar un nuevo administrador
  public registrar(): void {
    if (!this.validar(false)) {
      return;
    }

    if (this.admin.password !== this.admin.confirmar_password) {
      alert('Las contraseñas no coinciden');
      this.admin.password = '';
      this.admin.confirmar_password = '';
      return;
    }

    const payload = {
      rol: this.rol || 'administrador',
      first_name: this.admin.first_name,
      last_name: this.admin.last_name,
      email: this.admin.email,
      password: this.admin.password,
      clave_admin: this.admin.clave_admin,
      telefono: this.admin.telefono,
      rfc: (this.admin.rfc || '').toUpperCase(),
      edad: this.admin.edad ? Number(this.admin.edad) : null,
      ocupacion: this.admin.ocupacion,
    };

    this.administradoresService.crearAdministrador(payload).subscribe({
      next: (response) => {
        alert('Usuario registrado correctamente');
        console.log('Usuario registrado: ', response);
        if (this.token) {
          this.router.navigate(['home']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        alert('No se pudo registrar usuario');
      },
    });
  }

  // Actualizar un administrador existente
  public actualizar(): void {
    if (!this.validar(true)) {
      return;
    }

    const payload = {
      id: this.admin.id,
      clave_admin: this.admin.clave_admin,
      telefono: this.admin.telefono,
      rfc: this.admin.rfc,
      edad: this.admin.edad ? Number(this.admin.edad) : null,
      ocupacion: this.admin.ocupacion,
      first_name: this.admin.first_name,
      last_name: this.admin.last_name,
    };

    this.administradoresService.actualizarAdministrador(payload).subscribe({
      next: (response) => {
        alert('Administrador editado correctamente');
        console.log('Admin editado: ', response);
        this.router.navigate(['home']);
      },
      error: () => {
        alert('No se pudo editar el administrador');
      },
    });
  }

  // Validación básica de los campos del admin
  private validar(esEdicion: boolean): boolean {
    this.errors = {};

    if (!this.admin.clave_admin) {
      this.errors.clave_admin = 'La clave de administrador es obligatoria';
    }

    if (!this.admin.first_name) {
      this.errors.first_name = 'El nombre es obligatorio';
    }

    if (!this.admin.last_name) {
      this.errors.last_name = 'Los apellidos son obligatorios';
    }

    if (!this.admin.email) {
      this.errors.email = 'El correo electrónico es obligatorio';
    } else if (!this.admin.email.includes('@')) {
      this.errors.email = 'El correo electrónico no es válido';
    }

    if (!esEdicion) {
      if (!this.admin.password) {
        this.errors.password = 'La contraseña es obligatoria';
      }
      if (!this.admin.confirmar_password) {
        this.errors.confirmar_password = 'Debe confirmar la contraseña';
      }
    }

    if (!this.admin.telefono) {
      this.errors.telefono = 'El teléfono es obligatorio';
    }

    if (!this.admin.rfc) {
      this.errors.rfc = 'El RFC es obligatorio';
    } else if (
      (this.admin.rfc as string).length < 12 ||
      (this.admin.rfc as string).length > 13
    ) {
      this.errors.rfc = 'El RFC debe tener entre 12 y 13 caracteres';
    }

    if (!this.admin.edad) {
      this.errors.edad = 'La edad es obligatoria';
    }

    if (!this.admin.ocupacion) {
      this.errors.ocupacion = 'La ocupación es obligatoria';
    }

    return Object.keys(this.errors).length === 0;
  }

  // Permite solo letras y espacio
  public soloLetras(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}
