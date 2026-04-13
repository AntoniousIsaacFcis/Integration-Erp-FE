import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { JobLevelService } from '@features/organization/services/job-level-service';
import { Router } from '@angular/router';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { ICreateEmployeeLevel } from '@features/organization/models/iemployee-level';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-create-level-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppRadioComponent,
  ],
  templateUrl: './create-level-component.html',
  styleUrl: './create-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLevelComponent {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private _jobLevelService = inject(JobLevelService);
  private readonly _translocoService = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef); // to kill create request if browser closed

  isSubmitting = signal(false);

  jobLevelForm = this.fb.group({
    levelOrder: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    isActive: this.fb.nonNullable.control(true, [Validators.required]),
    description: this.fb.nonNullable.control('', [AppValidators.charLimit(this.descriptionCharacterLimit)]),
  });
  // 1. Capture the description value as a signal
  private descriptionValue = toSignal(this.jobLevelForm.controls.description.valueChanges, {
    initialValue: '',
  });
  characterCount = computed(() => (this.descriptionValue() ?? '').length);
  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  isFormSubmitted = signal(false);

  constructor() {
    this.jobLevelForm.controls.levelOrder.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearControlError('levelOrder', 'duplicate'));
  }

  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.clearControlError('levelOrder', 'duplicate');
    this.jobLevelForm.updateValueAndValidity();

    if (this.jobLevelForm.invalid) {
      this.jobLevelForm.markAllAsTouched();
      console.warn('Form is invalid, submission blocked.');
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.jobLevelForm.getRawValue();
    const description = formData.description?.trim();
    const payload: ICreateEmployeeLevel = {
      levelOrder: Number(formData.levelOrder),
      name: formData.name.trim(),
      isActive: formData.isActive,
      ...(description ? { description } : {}),
    };

    this._jobLevelService
      .isLevelOrderTaken(payload.levelOrder)
      .pipe(
        switchMap((isTaken) => {
          if (isTaken) {
            this.setControlError('levelOrder', 'duplicate');
            this.isSubmitting.set(false);
            return EMPTY;
          }

          return this._jobLevelService.create(payload);
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (response) => {
          const successMsg = this._translocoService.translate('COMMON.SUCCESS_MESSAGE');
          console.log('✅ Success:', successMsg);

          this.isFormSubmitted.set(false);
          this.isSubmitting.set(false);

          const success = await this.router.navigate(['/', 'organization', 'levels', 'view']);

          if (!success) {
            console.error('❌ Navigation failed!');
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Submission Error:', error);
          // هنا يفضل استدعاء ToastService لإظهار الخطأ
        },
      });
  }

  private setControlError(controlName: 'levelOrder' | 'name' | 'description', errorKey: string) {
    const control = this.jobLevelForm.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), [errorKey]: true });
    control.markAsTouched();
  }

  private clearControlError(controlName: 'levelOrder' | 'name' | 'description', errorKey: string) {
    const control = this.jobLevelForm.controls[controlName];
    const errors = control.errors;
    if (!errors?.[errorKey]) return;

    const { [errorKey]: _removed, ...remainingErrors } = errors;
    control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  private normalizeStringFields() {
    const nameControl = this.jobLevelForm.controls.name;
    const descriptionControl = this.jobLevelForm.controls.description;

    const trimmedName = nameControl.value.trim();
    const trimmedDescription = descriptionControl.value.trim();

    if (nameControl.value !== trimmedName) {
      nameControl.setValue(trimmedName);
    }

    if (descriptionControl.value !== trimmedDescription) {
      descriptionControl.setValue(trimmedDescription);
    }
  }

  onCancel() {
    this.router.navigate(['/organization/levels/view']);
  }
}
