import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor(private snackBar: MatSnackBar) { }

    /**
     * Show success message (green)
     * @param message Message to display
     * @param duration Duration in milliseconds (default: 3000)
     */
    success(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
        });
    }

    /**
     * Show error message (red)
     * @param message Message to display
     * @param duration Duration in milliseconds (default: 4000)
     */
    error(message: string, duration: number = 4000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
        });
    }

    /**
     * Show warning message (orange)
     * @param message Message to display
     * @param duration Duration in milliseconds (default: 3500)
     */
    warning(message: string, duration: number = 3500): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-warning']
        });
    }

    /**
     * Show info message (blue)
     * @param message Message to display
     * @param duration Duration in milliseconds (default: 3000)
     */
    info(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: duration,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-info']
        });
    }
}
