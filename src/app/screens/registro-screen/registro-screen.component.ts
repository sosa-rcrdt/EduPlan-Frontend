import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';

import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { Administrador, Alumno, Maestro } from 'src/app/models/usuario.models';

@Component({
  selector: 'app-registro-screen',
  templateUrl: './registro-screen.component.html',
  styleUrls: ['./registro-screen.component.scss'],
})
export class RegistroScreenComponent implements OnInit {
  public tipo: string = 'registro-usuarios'; // se usa para el navbar

  // JSON genérico para enviar/recibir datos del usuario (admin, maestro, alumno)
  public user: any = {};

  public isUpdate: boolean = false;
  public errors: any = {};

  // Banderas para el tipo de usuario
  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  // Cuando se edita, se deshabilita el cambio de tipo de usuario
  public editar: boolean = false;

  // Rol seleccionado: 'administrador' | 'alumno' | 'maestro'
  public tipo_user: string = '';

  // Info del usuario a editar
  public idUser: number = 0;
  public rol: string = '';

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService
  ) {}

  ngOnInit(): void {
  // Detectar rol desde la URL (para edición)
  if (this.activatedRoute.snapshot.params['rol'] !== undefined) {
    this.rol = this.activatedRoute.snapshot.params['rol'];
    console.log('Rol detectado: ', this.rol);
  }

  // Detectar id desde la URL (si viene, es edición)
  if (this.activatedRoute.snapshot.params['id'] !== undefined) {
    this.editar = true;
    this.isUpdate = true;
    this.idUser = Number(this.activatedRoute.snapshot.params['id']);
    console.log('ID User: ', this.idUser);

    // Obtener los datos del usuario para precargar el formulario
    this.obtenerUserByID();
  } else {
    this.user.tipo_usuario = 'administrador';
    this.isAdmin = true;
    this.isAlumno = false;
    this.isMaestro = false;
    this.tipo_user = 'administrador';
  }
}


  // Obtiene un usuario por su ID según el rol (administrador, maestro o alumno)
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

  // Cambia el formulario visible según el radio button seleccionado
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
}
