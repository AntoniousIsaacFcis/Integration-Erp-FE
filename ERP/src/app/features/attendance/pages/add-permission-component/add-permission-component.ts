import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICreatePermissionRequest } from '@features/attendance/models/ipermissions';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileText, lucideSearch } from '@ng-icons/lucide';
import { of, startWith } from 'rxjs';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { PermissionService } from '@features/attendance/services/permission-service';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { IDocument } from '@shared/models/idocument';
import { DocumentsComponent } from "@shared/components/organisms/documents-component/documents-component";
import { fileValidation } from '@shared/validators/file-validation.validator';

@Component({
  selector: 'app-add-permission-component',
  imports: [ReactiveFormsModule, TranslocoModule, NgIcon, FormContainerComponent, AppSelectComponent, AppDateInputComponent, AppInputComponent, FormCancelButtonComponent, FormSaveButtonComponent, DocumentsComponent],
  templateUrl: './add-permission-component.html',
  styleUrl: './add-permission-component.css',
  providers: [provideIcons({ lucideSearch, lucideFileText })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPermissionComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private permissionService = inject(PermissionService);
  private readonly today = new Date().toISOString().split('T')[0];

  submitted = signal(false);
  saveTrigger = signal<ICreatePermissionRequest | null>(null);

  mainForm = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    calender: ['', [Validators.required]],
    type: ['', [Validators.required]],
    leaveType: [''],
    fromDate: ['', [Validators.required]],
    toDate: ['', [Validators.required]],
    applayDate: [this.today, [Validators.required]],
    notes: ['', [AppValidators.wordLimit(100)]],
    attachedFiles: [[] as IDocument[], [ Validators.minLength(1), fileValidation(10, ['application/pdf', 'image/jpeg', 'image/png'])]]
  }, {
    validators: [dateRangeValidator('fromDate', 'toDate')],
  });

  typeValue = toSignal(
    this.mainForm.controls.type.valueChanges.pipe(startWith(this.mainForm.controls.type.value))
  );

  isLeave = computed(() => this.typeValue() === 'leave' || this.typeValue() === 'halfLeave');

  saveResource = rxResource({
    params: () => this.saveTrigger(),
    stream: ({ params }) => params ? this.permissionService.createPermission(params) : of(null)
  });

  getControl(name: keyof ICreatePermissionRequest): FormControl {
    return this.mainForm.get(name) as FormControl;
  }

  handleFilesChange(files: IDocument[]) {
  this.mainForm.patchValue({ attachedFiles: files });
  this.mainForm.get('attachedFiles')?.markAsTouched();
  this.mainForm.get('attachedFiles')?.updateValueAndValidity();
}

  onSave() {
    this.submitted.set(true);
    if (this.mainForm.valid) {
      const payload = this.mainForm.getRawValue() as ICreatePermissionRequest;
      this.saveTrigger.set(payload);
      this.router.navigate(['/attendance/view-permissions']);
    }
  }

  onCancel() {
    this.router.navigate(['/attendance/view-permissions']);
  }
}
