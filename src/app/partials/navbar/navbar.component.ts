import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {

  constructor(private router: Router) {}

  // Ir a la landing (ajusta el path al que tengas en tu routing)
  goLanding(): void {
    this.router.navigate(['']);
  }

  // Ir a la pantalla de login (tu login-screen actual)
  goLogin(): void {
    // En tu proyecto actual el login está en la raíz ('/')
    this.router.navigate(['login']);
  }

  // Ir a la pantalla de registro de usuarios
  goRegistro(): void {
    // Has estado usando 'registro-usuarios' como path del registro
    this.router.navigate(['registro']);
  }
}
