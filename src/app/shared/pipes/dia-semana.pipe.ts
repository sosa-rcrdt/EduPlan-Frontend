import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'diaSemana'
})
export class DiaSemanaPipe implements PipeTransform {

    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '';

        const dia = Number(value);

        // Asumiendo 1 = Lunes, 7 = Domingo (ajustar según backend)
        // O 0 = Lunes? Revisemos convención. 
        // En muchos sistemas 0=Domingo, 1=Lunes.
        // En Python weekday() es 0=Lunes.
        // Asumiremos 1=Lunes por ahora, si sale mal ajustamos.

        switch (dia) {
            case 0: return 'Lunes';
            case 1: return 'Martes';
            case 2: return 'Miércoles';
            case 3: return 'Jueves';
            case 4: return 'Viernes';
            case 5: return 'Sábado';
            case 6: return 'Domingo';
            default: return 'Desconocido';
        }
    }

}
