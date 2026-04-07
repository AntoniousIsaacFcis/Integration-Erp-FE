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
import { JobLevelService } from '@features/job-level/service/job-level-service';
import { Router } from '@angular/router';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { ICreateOrganizationLevel } from '@features/organization/models/iorganization-level';
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
  ],
  templateUrl: './create-level-component.html',
  styleUrl: './create-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLevelComponent {
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
    description: this.fb.nonNullable.control('', [AppValidators.wordLimit(250)]),
  });
  // 1. Capture the description value as a signal
  private descriptionValue = toSignal(this.jobLevelForm.controls.description.valueChanges, {
    initialValue: '',
  });
  // 2.
  wordCount = computed(() => {
    const text = this.descriptionValue() ?? '';
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  });
  // 3.
  isOverLimit = computed(() => this.wordCount() > 250);

  isFormSubmitted = signal(false);

  constructor() {
    this.jobLevelForm.controls.levelOrder.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearControlError('levelOrder', 'duplicate'));
  }

  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
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
    const payload: ICreateOrganizationLevel = {
      levelOrder: Number(formData.levelOrder),
      name: formData.name.trim(),
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

          const success = await this.router.navigate(['/', 'job-levels', 'view']);

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

  onCancel() {
    this.isFormSubmitted.set(false);
    this.jobLevelForm.reset({
      levelOrder: null,
      name: '',
      description: '',
    });
  }
}
