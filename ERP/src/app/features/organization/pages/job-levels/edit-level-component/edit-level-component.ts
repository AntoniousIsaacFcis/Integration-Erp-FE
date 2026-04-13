import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobLevelService } from '@features/organization/services/job-level-service';
import { IUpdateEmployeeLevel } from '@features/organization/models/iemployee-level';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-level-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    FormSaveButtonComponent,
    FormCancelButtonComponent,
    AppInputComponent,
    AppRadioComponent,
    AppTextareaComponent,
  ],
  templateUrl: './edit-level-component.html',
  styleUrl: './edit-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLevelComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly jobLevelService = inject(JobLevelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private levelId = '';

  isLoading = signal(true);
  isSubmitting = signal(false);
  isFormSubmitted = signal(false);

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

  private descriptionValue = toSignal(this.jobLevelForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => (this.descriptionValue() ?? '').length);

  isOverLimit = computed(() => this.characterCount() > this.descriptionCharacterLimit);

  constructor() {
    this.jobLevelForm.controls.levelOrder.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearControlError('levelOrder', 'duplicate'));
  }

  ngOnInit() {
    this.levelId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.levelId) {
      this.router.navigate(['/organization/levels/view']);
      return;
    }

    this.jobLevelService
      .getById(this.levelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (level) => {
          this.jobLevelForm.patchValue({
            levelOrder: level.levelOrder,
            name: level.name,
            isActive: level.isActive !== false,
            description: level.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load level:', error);
          this.isLoading.set(false);
          this.router.navigate(['/organization/levels/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.normalizeStringFields();
    this.clearControlError('levelOrder', 'duplicate');
    this.jobLevelForm.updateValueAndValidity();

    if (this.jobLevelForm.invalid) {
      this.jobLevelForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.jobLevelForm.getRawValue();
    const description = formData.description?.trim();
    const payload: IUpdateEmployeeLevel = {
      levelOrder: Number(formData.levelOrder),
      name: formData.name.trim(),
      isActive: formData.isActive,
      ...(description ? { description } : {}),
    };

    this.jobLevelService
      .isLevelOrderTaken(payload.levelOrder, this.levelId)
      .pipe(
        switchMap((isTaken) => {
          if (isTaken) {
            this.setControlError('levelOrder', 'duplicate');
            this.isSubmitting.set(false);
            return EMPTY;
          }

          return this.jobLevelService.update(this.levelId, payload);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.isFormSubmitted.set(false);
          this.isSubmitting.set(false);
          this.router.navigate(['/organization/levels/view']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Update level failed:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/organization/levels/view']);
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
}
