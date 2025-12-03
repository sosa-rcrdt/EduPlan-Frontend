import { Component, EventEmitter, Input, OnInit, Output, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

declare var $: any; // jQuery for Bootstrap modal

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() modalId: string = 'confirmationModal';
    @Input() title: string = 'Confirmar Acción';
    @Input() message: string = '¿Estás seguro de realizar esta acción?';
    @Input() btnConfirmText: string = 'Confirmar';
    @Input() btnCancelText: string = 'Cancelar';
    @Input() btnConfirmColor: string = 'btn-danger'; // btn-primary, btn-danger, etc.

    @Output() onConfirm = new EventEmitter<void>();
    @Output() onCancel = new EventEmitter<void>();

    constructor(private elementRef: ElementRef) { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        // Mover el modal al body para evitar problemas de z-index/backdrop
        document.body.appendChild(this.elementRef.nativeElement);
    }

    ngOnDestroy(): void {
        // Limpiar el elemento del DOM al destruir el componente
        this.elementRef.nativeElement.remove();
        // Asegurar que el backdrop también se elimine si el modal estaba abierto
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    public confirm(): void {
        this.onConfirm.emit();
        this.hide();
    }

    public cancel(): void {
        this.onCancel.emit();
        this.hide();
    }

    public show(): void {
        $(`#${this.modalId}`).modal('show');
    }

    public hide(): void {
        $(`#${this.modalId}`).modal('hide');
    }
}
