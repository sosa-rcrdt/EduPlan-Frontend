import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {

  constructor(private router: Router) { }

  // Ir a la landing
  goLanding(): void {
    this.router.navigate(['']);
  }

  // Ir a la pantalla de login
  goLogin(): void {
    this.router.navigate(['login']);
  }

  // Ir a la pantalla de registro de usuarios
  goRegistro(): void {
    this.router.navigate(['registro']);
  }
}
