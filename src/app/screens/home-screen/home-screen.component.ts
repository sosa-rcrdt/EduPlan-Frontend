import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserRole } from 'src/app/shared/models/auth.models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {

  public rol: UserRole = "";
  public showDashboard: boolean = true; // Mostrar dashboard solo en ruta base /home

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.rol = this.auth.getCurrentRole();
    console.log("Rol: ", this.rol);

    // Detectar si estamos en la ruta base /home o en una subruta
    this.checkRoute();

    // Suscribirse a cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute();
    });
  }

  private checkRoute(): void {
    // Mostrar dashboard solo si estamos en /home exactamente (sin subrutas)
    const url = this.router.url;
    this.showDashboard = (url === '/home' || url === '/home/');
  }
}
