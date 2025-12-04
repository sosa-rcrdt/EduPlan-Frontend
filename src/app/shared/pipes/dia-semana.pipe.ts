import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'diaSemana'
})
export class DiaSemanaPipe implements PipeTransform {

    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '';

        const dia = Number(value);

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
