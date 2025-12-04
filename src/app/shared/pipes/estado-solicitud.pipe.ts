import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'estadoSolicitud'
})
export class EstadoSolicitudPipe implements PipeTransform {

    transform(value: string | null | undefined): string {
        if (!value) return '';

        switch (value) {
            case 'PENDIENTE': return 'Pendiente';
            case 'APROBADA': return 'Aprobada';
            case 'RECHAZADA': return 'Rechazada';
            default: return value;
        }
    }

}
