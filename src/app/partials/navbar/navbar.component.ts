import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserRole } from 'src/app/models/auth.models';

declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() tipo: string = '';         // Ej: 'registro-usuarios' en la pantalla de registro
  @Input() rol: string = '';          // Se sobreescribe con el rol del AuthService

  public token: string = '';
  public editar: boolean = false;

  constructor(
    private authService: AuthService,
    public activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentRole: UserRole = this.authService.getCurrentRole();
    this.rol = currentRole || '';

    this.token = this.authService.getAccessToken() || '';

    // Si en la URL viene un id, asumimos modo edición
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
    }
  }

  // Navega a la pantalla de registro de usuarios
  public goRegistro(): void {
    this.router.navigate(['registro-usuarios']);
  }

  // Navega a la pantalla de login (cuando estás en registro sin sesión)
  public goLogin(): void {
    this.router.navigate(['/']);
  }

  // Cerrar sesión usando AuthService
  public logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error(error);
        // Aunque falle la petición, el AuthService ya limpió el localStorage
        this.router.navigate(['/']);
      },
    });
  }

  // Maneja los clics de la navbar y activa visualmente el link
  public clickNavLink(link: string): void {
    this.router.navigate([link]);
    setTimeout(() => {
      this.activarLink(link);
    }, 100);
  }

  public activarLink(link: string): void {
    if (link === 'alumnos') {
      $('#principal').removeClass('active');
      $('#maestro').removeClass('active');
      $('#graficas').removeClass('active');
      $('#alumno').addClass('active');
    } else if (link === 'maestros') {
      $('#principal').removeClass('active');
      $('#alumno').removeClass('active');
      $('#graficas').removeClass('active');
      $('#maestro').addClass('active');
    } else if (link === 'graficas') {
      $('#alumno').removeClass('active');
      $('#maestro').removeClass('active');
      $('#principal').removeClass('active');
      $('#graficas').addClass('active');
    } else if (link === 'home') {
      $('#alumno').removeClass('active');
      $('#maestro').removeClass('active');
      $('#graficas').removeClass('active');
      $('#principal').addClass('active');
    }
  }
}
