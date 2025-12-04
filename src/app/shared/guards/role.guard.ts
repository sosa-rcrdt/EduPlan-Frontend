import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRole = route.data['expectedRole'];
        const currentRole = this.authService.getCurrentRole();

        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        if (currentRole === expectedRole) {
            return true;
        } else {
            // Si el rol no coincide, redirigir al home o mostrar error
            this.router.navigate(['/home']);
            return false;
        }
    }
}
