import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { UserProfile, User } from 'src/app/models/usuario.models';

type RolUsuario = 'alumno' | 'maestro' | 'administrador' | null;

interface MenuItem {
  label: string;
  icon: string;           // Material Icon name
  route?: string;         // ruta a navegar
  action?: 'logout';      // acción especial
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();

  profile: UserProfile = null;
  rol: RolUsuario = null;

  menuItems: MenuItem[] = [];
  logoutItem: MenuItem = { label: 'Cerrar sesión', icon: 'logout', action: 'logout' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.profile = this.authService.getCurrentProfile();
    this.rol = this.getRolFromAuth();
    this.buildMenuForRole();
  }

  // Obtiene el rol desde AuthService o localStorage
  private getRolFromAuth(): RolUsuario {
    const anyAuth = this.authService as any;

    if (typeof anyAuth.getCurrentRole === 'function') {
      return anyAuth.getCurrentRole();
    }
    if (typeof anyAuth.getRole === 'function') {
      return anyAuth.getRole();
    }

    const storedRol = localStorage.getItem('rol');
    if (storedRol === 'alumno' || storedRol === 'maestro' || storedRol === 'administrador') {
      return storedRol;
    }

    return null;
  }

  private buildMenuForRole(): void {
    const items: MenuItem[] = [];

    if (this.rol === 'alumno') {
      items.push({
        label: 'Mi carga académica',
        icon: 'school',
        route: '/home', // Alumno home es su carga
      });
    }

    if (this.rol === 'maestro') {
      items.push(
        {
          label: 'Mis horarios',
          icon: 'event_note',
          route: '/home',
        },
        {
          label: 'Solicitudes de cambio',
          icon: 'edit_note',
          route: '/solicitud-maestro',
        }
      );
    }

    if (this.rol === 'administrador') {
      items.push(
        {
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/home',
        },
        {
          label: 'Periodos',
          icon: 'calendar_today',
          route: '/home/admin/periodos',
        },
        {
          label: 'Materias',
          icon: 'book',
          route: '/home/admin/materias',
        },
        {
          label: 'Grupos',
          icon: 'groups',
          route: '/home/admin/grupos',
        },
        {
          label: 'Aulas',
          icon: 'meeting_room',
          route: '/home/admin/aulas',
        },
        {
          label: 'Horarios',
          icon: 'schedule',
          route: '/home/admin/horarios',
        },
        {
          label: 'Reportes',
          icon: 'bar_chart',
          route: '/home/admin/reportes',
        }
      );
    }

    this.menuItems = items;
  }

  get nombreUsuario(): string {
    if (!this.profile) {
      return '';
    }

    const p: any = this.profile as any;

    if (p.user && p.user.first_name !== undefined) {
      return `${p.user.first_name} ${p.user.last_name}`.trim();
    }

    if ((this.profile as User).first_name !== undefined) {
      const u = this.profile as User;
      return `${u.first_name} ${u.last_name}`.trim();
    }

    return '';
  }

  get etiquetaRol(): string {
    if (this.rol === 'alumno') return 'Alumno';
    if (this.rol === 'maestro') return 'Docente';
    if (this.rol === 'administrador') return 'Administrador';
    return '';
  }

  onItemClick(item: MenuItem): void {
    if (item.action === 'logout') {
      this.handleLogout();
      this.closeSidenav.emit();
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);
      this.closeSidenav.emit();
    }
  }

  private handleLogout(): void {
    const anyAuth = this.authService as any;

    if (typeof anyAuth.logout === 'function') {
      anyAuth.logout();
    } else {
      localStorage.clear();
    }

    this.router.navigate(['/login']);
  }
}
