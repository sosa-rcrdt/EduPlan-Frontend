import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { AlumnosService } from 'src/app/services/alumnos.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss'],
})
export class RegistroAlumnosComponent implements OnInit, OnChanges {
  @Input() rol: string = '';        // 'alumno' desde el registro-screen
  @Input() datos_user: any = {};    // datos precargados cuando se edita
  @Input() isSelfEdit: boolean = false; // modo auto-edición

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno: any = {};
  public token: string = '';
  public errors: any = {};
  public editar: boolean = false;
  public idUser: number = 0;

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    // Si hay id en la URL, estamos en modo edición
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      this.idUser = Number(this.activatedRoute.snapshot.params['id']);
      console.log('ID User: ', this.idUser);

      // Datos vienen desde registro-screen como datos_user
      this.alumno = { ...this.datos_user };

      // Normalizar fecha_nacimiento si viene como "YYYY-MM-DDTHH:mm:ssZ"
      if (this.alumno.fecha_nacimiento) {
        const parts = (this.alumno.fecha_nacimiento as string).split('T');
        this.alumno.fecha_nacimiento = parts[0]; // "YYYY-MM-DD"
      }
    } else if (this.isSelfEdit) {
      this.editar = true;
      this.alumno = { ...this.datos_user };
      // Normalizar fecha_nacimiento si viene como "YYYY-MM-DDTHH:mm:ssZ"
      if (this.alumno.fecha_nacimiento) {
        const parts = (this.alumno.fecha_nacimiento as string).split('T');
        this.alumno.fecha_nacimiento = parts[0]; // "YYYY-MM-DD"
      }
    } else {
      // Alta nueva: inicializamos el objeto alumno
      this.alumno = {
        matricula: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmar_password: '',
        fecha_nacimiento: '',
        curp: '',
        rfc: '',
        edad: '',
        telefono: '',
        ocupacion: '',
        rol: this.rol || 'alumno',
      };
    }

    this.token = this.authService.getAccessToken() || '';
    console.log('Alumno (form): ', this.alumno);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reactively update alumno when datos_user changes from parent
    if (changes['datos_user'] && changes['datos_user'].currentValue) {
      this.alumno = { ...changes['datos_user'].currentValue };

      // Normalizar fecha_nacimiento si viene como "YYYY-MM-DDTHH:mm:ssZ"
      if (this.alumno.fecha_nacimiento) {
        const parts = (this.alumno.fecha_nacimiento as string).split('T');
        this.alumno.fecha_nacimiento = parts[0];
      }

      console.log('Alumno actualizado desde ngOnChanges: ', this.alumno);
    }
  }

  public regresar(): void {
    this.location.back();
  }

  // Mostrar/ocultar contraseña
  public showPassword(): void {
    if (this.inputType_1 === 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  // Mostrar/ocultar confirmación de contraseña
  public showPwdConfirmar(): void {
    if (this.inputType_2 === 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  // Registrar nuevo alumno
  public registrar(): void {
    if (!this.validar(false)) {
      return;
    }

    if (this.alumno.password !== this.alumno.confirmar_password) {
      alert('Las contraseñas no coinciden');
      this.alumno.password = '';
      this.alumno.confirmar_password = '';
      return;
    }

    const payload = {
      rol: this.rol || 'alumno',
      first_name: this.alumno.first_name,
      last_name: this.alumno.last_name,
      email: this.alumno.email,
      password: this.alumno.password,
      matricula: this.alumno.matricula,
      curp: (this.alumno.curp || '').toUpperCase(),
      rfc: (this.alumno.rfc || '').toUpperCase(),
      fecha_nacimiento: this.alumno.fecha_nacimiento,
      edad: this.alumno.edad ? Number(this.alumno.edad) : null,
      telefono: this.alumno.telefono,
      ocupacion: this.alumno.ocupacion,
    };

    this.alumnosService.crearAlumno(payload).subscribe({
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

  // Actualizar alumno existente
  public actualizar(): void {
    if (!this.validar(true)) {
      return;
    }

    // Si es auto-edición, usar ProfileService
    if (this.isSelfEdit) {
      const payload = {
        first_name: this.alumno.first_name,
        last_name: this.alumno.last_name,
        matricula: this.alumno.matricula,
        curp: (this.alumno.curp || '').toUpperCase(),
        rfc: (this.alumno.rfc || '').toUpperCase(),
        fecha_nacimiento: this.alumno.fecha_nacimiento,
        edad: this.alumno.edad ? Number(this.alumno.edad) : null,
        telefono: this.alumno.telefono,
        ocupacion: this.alumno.ocupacion,
      };

      this.profileService.updateProfile(payload).subscribe({
        next: (response) => {
          alert('Datos actualizados correctamente');
          // Update localStorage profile
          this.profileService.getProfile().subscribe({
            next: (updatedProfile) => {
              localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
              this.router.navigate(['/home']);
            }
          });
        },
        error: () => {
          alert('No se pudieron actualizar los datos');
        },
      });
      return;
    }

    // Modo normal de edición (admin editando a otro usuario)
    const payload = {
      id: this.alumno.id,
      matricula: this.alumno.matricula,
      curp: (this.alumno.curp || '').toUpperCase(),
      rfc: (this.alumno.rfc || '').toUpperCase(),
      fecha_nacimiento: this.alumno.fecha_nacimiento,
      edad: this.alumno.edad ? Number(this.alumno.edad) : null,
      telefono: this.alumno.telefono,
      ocupacion: this.alumno.ocupacion,
      first_name: this.alumno.first_name,
      last_name: this.alumno.last_name,
    };

    this.alumnosService.actualizarAlumno(payload).subscribe({
      next: (response) => {
        alert('Alumno editado correctamente');
        console.log('Alumno editado: ', response);
        this.router.navigate(['home']);
      },
      error: (error) => {
        alert('No se pudo editar el alumno');
      },
    });
  }

  // Validación básica de campos
  private validar(esEdicion: boolean): boolean {
    this.errors = {};

    if (!this.alumno.matricula) {
      this.errors.matricula = 'La matrícula es obligatoria';
    }

    if (!this.alumno.first_name) {
      this.errors.first_name = 'El nombre es obligatorio';
    }

    if (!this.alumno.last_name) {
      this.errors.last_name = 'Los apellidos son obligatorios';
    }

    if (!this.alumno.email) {
      this.errors.email = 'El correo electrónico es obligatorio';
    } else if (!this.alumno.email.includes('@')) {
      this.errors.email = 'El correo electrónico no es válido';
    }

    if (!esEdicion) {
      if (!this.alumno.password) {
        this.errors.password = 'La contraseña es obligatoria';
      }
      if (!this.alumno.confirmar_password) {
        this.errors.confirmar_password = 'Debe confirmar la contraseña';
      }
    }

    if (!this.alumno.fecha_nacimiento) {
      this.errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    }

    if (!this.alumno.curp) {
      this.errors.curp = 'La CURP es obligatoria';
    } else if ((this.alumno.curp as string).length !== 18) {
      this.errors.curp = 'La CURP debe tener 18 caracteres';
    }

    if (!this.alumno.rfc) {
      this.errors.rfc = 'El RFC es obligatorio';
    } else if (
      (this.alumno.rfc as string).length < 12 ||
      (this.alumno.rfc as string).length > 13
    ) {
      this.errors.rfc = 'El RFC debe tener entre 12 y 13 caracteres';
    }

    if (!this.alumno.edad) {
      this.errors.edad = 'La edad es obligatoria';
    }

    if (!this.alumno.telefono) {
      this.errors.telefono = 'El teléfono es obligatorio';
    }

    if (!this.alumno.ocupacion) {
      this.errors.ocupacion = 'La ocupación es obligatoria';
    }

    return Object.keys(this.errors).length === 0;
  }

  // Maneja el cambio de fecha desde el datepicker
  public changeFecha(event: any): void {
    if (event && event.value) {
      this.alumno.fecha_nacimiento = event.value.toISOString().split('T')[0];
      console.log('Fecha: ', this.alumno.fecha_nacimiento);
    }
  }
}
