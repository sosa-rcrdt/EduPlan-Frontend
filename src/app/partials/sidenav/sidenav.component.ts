import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { UserProfile, User } from 'src/app/shared/models/usuario.models';
import { EditProfileModalComponent } from 'src/app/modals/edit-profile-modal/edit-profile-modal.component';
import { NotificacionesModalComponent } from 'src/app/modals/notificaciones-modal/notificaciones-modal.component';

type RolUsuario = 'alumno' | 'maestro' | 'administrador' | null;

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: 'logout' | 'notificaciones';
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  @ViewChild('editProfileModal') editProfileModal!: EditProfileModalComponent;
  @ViewChild('notificacionesModal') notificacionesModal!: NotificacionesModalComponent;

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

  // Obtiene el rol desde AuthService
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
        route: '/home',
      });
      // Notificaciones para alumnos
      items.push({
        label: 'Notificaciones',
        icon: 'notifications',
        action: 'notificaciones'
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
          route: '/home/solicitudes',
        },
        // Notificaciones para maestros
        {
          label: 'Notificaciones',
          icon: 'notifications',
          action: 'notificaciones'
        }
      );
    }

    if (this.rol === 'administrador') {
      items.push(
        {
          label: 'Horarios',
          icon: 'dashboard',
          route: '/home',
        },
        {
          label: 'Peticiones',
          icon: 'notifications_active',
          route: '/home/peticiones',
        },
        {
          label: 'Periodos',
          icon: 'calendar_today',
          route: '/home/periodos',
        },
        {
          label: 'Materias',
          icon: 'book',
          route: '/home/materias',
        },
        {
          label: 'Grupos',
          icon: 'groups',
          route: '/home/grupos',
        },
        {
          label: 'Aulas',
          icon: 'meeting_room',
          route: '/home/aulas',
        },
        {
          label: 'Inscripciones',
          icon: 'assignment_ind',
          route: '/home/inscripciones',
        },
        {
          label: 'Reportes',
          icon: 'bar_chart',
          route: '/home/reportes',
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

    if (item.action === 'notificaciones') {
      this.notificacionesModal.show();
      this.closeSidenav.emit();
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);
      this.closeSidenav.emit();
    }
  }

  public openEditProfileModal(): void {
    if (this.editProfileModal) {
      this.editProfileModal.show();
    }
  }

  public navigateToEditData(): void {
    this.router.navigate(['/registro'], { queryParams: { mode: 'self-edit' } });
    this.closeSidenav.emit();
  }

  public navigateToChangePassword(): void {
    this.router.navigate(['/registro'], { queryParams: { mode: 'change-password' } });
    this.closeSidenav.emit();
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
