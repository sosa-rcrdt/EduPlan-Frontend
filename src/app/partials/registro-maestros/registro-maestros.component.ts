import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MaestrosService } from 'src/app/services/maestros.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss'],
})
export class RegistroMaestrosComponent implements OnInit {
  @Input() rol: string = '';        // 'maestro' desde registro-screen
  @Input() datos_user: any = {};    // datos precargados en edición

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idUser: number = 0;

  // Select áreas
  public areas: any[] = [
    { value: '1', viewValue: 'Desarrollo Web' },
    { value: '2', viewValue: 'Programación' },
    { value: '3', viewValue: 'Bases de datos' },
    { value: '4', viewValue: 'Redes' },
    { value: '5', viewValue: 'Matemáticas' },
  ];

  // Lista de materias fijas (se guardan en materias_json)
  public materias: any[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];

  constructor(
    private maestrosService: MaestrosService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si hay ID en la URL -> edición
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      this.idUser = Number(this.activatedRoute.snapshot.params['id']);
      console.log('ID User: ', this.idUser);

      // Datos llegan desde el registro-screen
      this.maestro = { ...this.datos_user };

      // Normalizar fecha_nacimiento si viene con "T"
      if (this.maestro.fecha_nacimiento) {
        const parts = (this.maestro.fecha_nacimiento as string).split('T');
        this.maestro.fecha_nacimiento = parts[0];
      }

      // Asegurar que materias_json sea array
      if (!Array.isArray(this.maestro.materias_json)) {
        this.maestro.materias_json = this.maestro.materias_json
          ? [...this.maestro.materias_json]
          : [];
      }
    } else {
      // Alta nueva
      this.maestro = {
        id_trabajador: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmar_password: '',
        fecha_nacimiento: '',
        telefono: '',
        rfc: '',
        cubiculo: '',
        area_investigacion: '',
        materias_json: [] as string[],
        rol: this.rol || 'maestro',
      };
    }

    this.token = this.authService.getAccessToken() || '';
    console.log('Maestro (form): ', this.maestro);
  }

  public regresar(): void {
    this.location.back();
  }

  // Registrar maestro nuevo
  public registrar(): void {
    if (!this.validar(false)) {
      return;
    }

    if (this.maestro.password !== this.maestro.confirmar_password) {
      alert('Las contraseñas no coinciden');
      this.maestro.password = '';
      this.maestro.confirmar_password = '';
      return;
    }

    const payload = {
      rol: this.rol || 'maestro',
      first_name: this.maestro.first_name,
      last_name: this.maestro.last_name,
      email: this.maestro.email,
      password: this.maestro.password,
      id_trabajador: this.maestro.id_trabajador,
      fecha_nacimiento: this.maestro.fecha_nacimiento,
      telefono: this.maestro.telefono,
      rfc: (this.maestro.rfc || '').toUpperCase(),
      cubiculo: this.maestro.cubiculo,
      area_investigacion: this.maestro.area_investigacion,
      materias_json: this.maestro.materias_json || [],
    };

    this.maestrosService.crearMaestro(payload).subscribe({
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

  // Actualizar maestro existente
  public actualizar(): void {
    if (!this.validar(true)) {
      return;
    }

    const payload = {
      id: this.maestro.id,
      id_trabajador: this.maestro.id_trabajador,
      fecha_nacimiento: this.maestro.fecha_nacimiento,
      telefono: this.maestro.telefono,
      rfc: this.maestro.rfc,
      cubiculo: this.maestro.cubiculo,
      area_investigacion: this.maestro.area_investigacion,
      materias_json: this.maestro.materias_json || [],
      first_name: this.maestro.first_name,
      last_name: this.maestro.last_name,
    };

    this.maestrosService.actualizarMaestro(payload).subscribe({
      next: (response) => {
        alert('Maestro editado correctamente');
        console.log('Maestro editado: ', response);
        this.router.navigate(['home']);
      },
      error: () => {
        alert('No se pudo editar el maestro');
      },
    });
  }

  // Checkbox de materias para el nuevo formulario
  public checkboxChange(event: any, nombre: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!Array.isArray(this.maestro.materias_json)) {
      this.maestro.materias_json = [];
    }
    if (checked) {
      if (!this.maestro.materias_json.includes(nombre)) {
        this.maestro.materias_json.push(nombre);
      }
    } else {
      this.maestro.materias_json = this.maestro.materias_json.filter(
        (materia: string) => materia !== nombre
      );
    }
    console.log('Array materias: ', this.maestro.materias_json);
  }

  // Verifica si una materia debe aparecer seleccionada
  public revisarSeleccion(nombre: string): boolean {
    if (this.maestro.materias_json && Array.isArray(this.maestro.materias_json)) {
      const busqueda = this.maestro.materias_json.find(
        (element: string) => element === nombre
      );
      return busqueda !== undefined;
    }
    return false;
  }

  // Mostrar/ocultar password
  public showPassword(): void {
    if (this.inputType_1 === 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  // Mostrar/ocultar confirmación password
  public showPwdConfirmar(): void {
    if (this.inputType_2 === 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  // Manejar cambio de fecha
  public changeFecha(event: any): void {
    if (event && event.value) {
      this.maestro.fecha_nacimiento = event.value.toISOString().split('T')[0];
      console.log('Fecha: ', this.maestro.fecha_nacimiento);
    }
  }

  // Validación básica de campos
  private validar(esEdicion: boolean): boolean {
    this.errors = {};

    if (!this.maestro.id_trabajador) {
      this.errors.id_trabajador = 'El ID de trabajador es obligatorio';
    }

    if (!this.maestro.first_name) {
      this.errors.first_name = 'El nombre es obligatorio';
    }

    if (!this.maestro.last_name) {
      this.errors.last_name = 'Los apellidos son obligatorios';
    }

    if (!this.maestro.email) {
      this.errors.email = 'El correo electrónico es obligatorio';
    } else if (!this.maestro.email.includes('@')) {
      this.errors.email = 'El correo electrónico no es válido';
    }

    if (!esEdicion) {
      if (!this.maestro.password) {
        this.errors.password = 'La contraseña es obligatoria';
      }
      if (!this.maestro.confirmar_password) {
        this.errors.confirmar_password = 'Debe confirmar la contraseña';
      }
    }

    if (!this.maestro.fecha_nacimiento) {
      this.errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    }

    if (!this.maestro.telefono) {
      this.errors.telefono = 'El teléfono es obligatorio';
    }

    if (!this.maestro.rfc) {
      this.errors.rfc = 'El RFC es obligatorio';
    } else if (
      (this.maestro.rfc as string).length < 12 ||
      (this.maestro.rfc as string).length > 13
    ) {
      this.errors.rfc = 'El RFC debe tener entre 12 y 13 caracteres';
    }

    if (!this.maestro.cubiculo) {
      this.errors.cubiculo = 'El cubículo es obligatorio';
    }

    if (!this.maestro.area_investigacion) {
      this.errors.area_investigacion = 'El área de investigación es obligatoria';
    }

    if (!this.maestro.materias_json || this.maestro.materias_json.length === 0) {
      this.errors.materias_json = 'Debe seleccionar al menos una materia';
    }

    return Object.keys(this.errors).length === 0;
  }
}
