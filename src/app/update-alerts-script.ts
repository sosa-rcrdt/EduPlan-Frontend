// Script to batch update all remaining alert() calls to AlertService
// This TypeScript file documents the changes needed for all remaining components

/* 
 * Pattern for each component:
 * 1. Add import: import { AlertService } from 'src/app/services/alert.service';
 * 2. Inject in constructor: private alertService: AlertService
 * 3. Replace alert() calls:
 *    - Success operations: this.alertService.success("Message")
 *    - Error operations: this.alertService.error("Message")
 *    - Warnings: this.alertService.warning("Message")
 */

const componentsToUpdate = [
    // Materias
    {
        path: 'admin-screen/materias-screen/registro-materia-screen/registro-materia-screen.component.ts',
        alerts: [
            { line: 88, type: 'success', message: 'Materia creada correctamente' },
            { line: 117, type: 'success', message: 'Materia actualizada correctamente' }
        ]
    },
    {
        path: 'admin-screen/materias-screen/materias-screen.component.ts',
        alerts: [
            { line: 61, type: 'success', message: 'Materia eliminada correctamente' },
            { line: 68, type: 'error', message: 'No se pudo eliminar la materia. Intenta nuevamente' }
        ]
    },

    // Grupos
    {
        path: 'admin-screen/grupos-screen/registro-grupo-screen/registro-grupo-screen.component.ts',
        alerts: [
            { line: 110, type: 'success', message: 'Grupo creado correctamente' },
            { line: 139, type: 'success', message: 'Grupo actualizado correctamente' }
        ]
    },
    {
        path: 'admin-screen/grupos-screen/grupos-screen.component.ts',
        alerts: [
            { line: 81, type: 'success', message: 'Grupo eliminado correctamente' },
            { line: 88, type: 'error', message: 'No se pudo eliminar el grupo. Intenta nuevamente' }
        ]
    },

    // Aulas
    {
        path: 'admin-screen/aulas-screen/registro-aula-screen/registro-aula-screen.component.ts',
        alerts: [
            { line: 96, type: 'success', message: 'Aula creada correctamente' },
            { line: 126, type: 'success', message: 'Aula actualizada correctamente' }
        ]
    },
    {
        path: 'admin-screen/aulas-screen/aulas-screen.component.ts',
        alerts: [
            { line: 61, type: 'success', message: 'Aula eliminada correctamente' },
            { line: 68, type: 'error', message: 'No se pudo eliminar el aula. Intenta nuevamente' }
        ]
    },

    // Horarios
    {
        path: 'admin-screen/registro-horario-screen/registro-horario-screen.component.ts',
        alerts: [
            { line: 165, type: 'success', message: 'Horario creado correctamente' },
            { line: 198, type: 'success', message: 'Horario actualizado correctamente' }
        ]
    },
    {
        path: 'admin-screen/admin-screen.component.ts',
        alerts: [
            { line: 324, type: 'success', message: 'Horario eliminado correctamente' },
            { line: 331, type: 'error', message: 'No se pudo eliminar el horario. Intenta nuevamente' }
        ]
    },

    // Inscripciones
    {
        path: 'admin-screen/inscripciones-screen/registro-inscripcion-screen/registro-inscripcion-screen.component.ts',
        alerts: [
            { line: 152, type: 'warning', message: 'Por favor completa todos los campos requeridos' },
            { line: 168, type: 'success', message: 'Inscripción creada correctamente' },
            { line: 172, type: 'error', message: 'Error al crear inscripción' },
            { line: 193, type: 'success', message: 'Inscripción actualizada correctamente' },
            { line: 197, type: 'error', message: 'Error al actualizar inscripción' }
        ]
    },
    {
        path: 'admin-screen/inscripciones-screen/inscripciones-screen.component.ts',
        alerts: [
            { line: 46, type: 'error', message: 'Error al obtener inscripciones' },
            { line: 114, type: 'success', message: 'Inscripción eliminada correctamente' },
            { line: 118, type: 'error', message: 'Error al eliminar' }
        ]
    },

    // User Management
    {
        path: 'registro-screen/registro-screen.component.ts',
        alerts: [
            { line: 128, type: 'error', message: 'No se pudieron obtener los datos del usuario' },
            { line: 161, type: 'error', message: 'No se pudieron obtener los datos del administrador para editar' },
            { line: 177, type: 'error', message: 'No se pudieron obtener los datos del maestro para editar' },
            { line: 194, type: 'error', message: 'No se pudieron obtener los datos del alumno para editar' },
            { line: 258, type: 'success', message: 'Contraseña actualizada correctamente' },
            { line: 302, type: 'success', message: 'Datos actualizados correctamente' }
        ]
    },
    {
        path: 'cambiar-contrasena-screen/cambiar-contrasena-screen.component.ts',
        alerts: [
            { line: 103, type: 'success', message: 'Contraseña actualizada correctamente' }
        ]
    },
    {
        path: 'maestros-screen/solicitudes-screen/solicitudes-screen.component.ts',
        alerts: [
            { line: 280, type: 'success', message: 'Solicitud enviada correctamente' }
        ]
    }
];

console.log(`Total components to update: ${componentsToUpdate.length}`);
console.log(`Total alert() calls to replace: ${componentsToUpdate.reduce((sum, c) => sum + c.alerts.length, 0)}`);
