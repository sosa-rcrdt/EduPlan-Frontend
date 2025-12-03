import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { UserProfile, User } from 'src/app/models/usuario.models';

type RolUsuario = 'alumno' | 'maestro' | 'administrador' | null;

interface MenuItem {
  label: string;
  icon: string;           // aquí usaremos emojis como iconos
  route?: string;         // ruta a navegar
  action?: 'logout';      // acción especial
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  profile: UserProfile = null;
  rol: RolUsuario = null;

  // collapsed = solo iconos, expanded = iconos + texto
  isExpanded = false;

  menuItems: MenuItem[] = [];
  logoutItem: MenuItem = { label: 'Cerrar sesión', icon: '⏻', action: 'logout' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
        icon: '📚',
        route: '/home/alumno/carga',
      });
    }

    if (this.rol === 'maestro') {
      items.push(
        {
          label: 'Mis horarios',
          icon: '📅',
          route: 'home',
        },
        {
          label: 'Solicitudes de cambio',
          icon: '✏️',
          route: 'solicitud-maestro',
        }
      );
    }

    if (this.rol === 'administrador') {
      items.push(
        {
          label: 'Dashboard',
          icon: '📊',
          route: '/home/admin/dashboard',
        },
        {
          label: 'Periodos',
          icon: '📆',
          route: '/home/admin/periodos',
        },
        {
          label: 'Materias',
          icon: '📘',
          route: '/home/admin/materias',
        },
        {
          label: 'Grupos',
          icon: '👥',
          route: '/home/admin/grupos',
        },
        {
          label: 'Aulas',
          icon: '🏫',
          route: '/home/admin/aulas',
        },
        {
          label: 'Horarios',
          icon: '⏰',
          route: '/home/admin/horarios',
        },
        {
          label: 'Reportes',
          icon: '📈',
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

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onItemClick(item: MenuItem): void {
    if (item.action === 'logout') {
      this.handleLogout();
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);
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
