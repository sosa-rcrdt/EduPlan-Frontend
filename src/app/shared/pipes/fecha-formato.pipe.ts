import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fechaFormato'
})
export class FechaFormatoPipe implements PipeTransform {

    transform(value: string | null | undefined, formato: 'corto' | 'largo' | 'completo' = 'corto'): string {
        if (!value) return '';

        const fecha = new Date(value);

        if (isNaN(fecha.getTime())) return value;

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');

        switch (formato) {
            case 'corto':
                // Formato: DD/MM/YYYY
                return `${dia}/${mes}/${anio}`;

            case 'largo':
                // Formato: DD/MM/YYYY HH:mm
                return `${dia}/${mes}/${anio} ${horas}:${minutos}`;

            case 'completo':
                // Formato: DD de Mes de YYYY, HH:mm
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `${dia} de ${meses[fecha.getMonth()]} de ${anio}, ${horas}:${minutos}`;

            default:
                return `${dia}/${mes}/${anio}`;
        }
    }
}
