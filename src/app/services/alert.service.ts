import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor(private snackBar: MatSnackBar) { }

    success(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
    }

    error(message: string, duration: number = 4000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
        });
    }

    warning(message: string, duration: number = 3500): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-warning']
        });
    }

    info(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-info']
        });
    }
}
