import { Component, EventEmitter, Input, OnInit, Output, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-edit-profile-modal',
    templateUrl: './edit-profile-modal.component.html',
    styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() modalId: string = 'editProfileModal';
    @Output() onEditData = new EventEmitter<void>();
    @Output() onChangePassword = new EventEmitter<void>();

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

    public editData(): void {
        this.hide();
        // Emit after modal is hidden
        setTimeout(() => {
            this.onEditData.emit();
        }, 300);
    }

    public changePassword(): void {
        this.hide();
        // Emit after modal is hidden
        setTimeout(() => {
            this.onChangePassword.emit();
        }, 300);
    }

    public show(): void {
        $(`#${this.modalId}`).modal('show');
    }

    public hide(): void {
        $(`#${this.modalId}`).modal('hide');
    }
}
