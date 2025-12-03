import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-edit-profile-modal',
    templateUrl: './edit-profile-modal.component.html',
    styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {

    @Input() modalId: string = 'editProfileModal';
    @Output() onEditData = new EventEmitter<void>();
    @Output() onChangePassword = new EventEmitter<void>();

    constructor() { }

    ngOnInit(): void {
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
        // Force remove backdrop
        setTimeout(() => {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('overflow', '');
            $('body').css('padding-right', '');
        }, 200);
    }
}
