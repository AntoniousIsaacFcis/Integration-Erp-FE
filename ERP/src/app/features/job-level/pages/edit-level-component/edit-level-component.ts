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
import { JobLevelService } from '@features/job-level/service/job-level-service';
import { IUpdateOrganizationLevel } from '@features/organization/models/iorganization-level';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
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
    AppTextareaComponent,
  ],
  templateUrl: './edit-level-component.html',
  styleUrl: './edit-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLevelComponent implements OnInit {
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
    description: this.fb.nonNullable.control('', [AppValidators.wordLimit(250)]),
  });

  private descriptionValue = toSignal(this.jobLevelForm.controls.description.valueChanges, {
    initialValue: '',
  });

  wordCount = computed(() => {
    const text = this.descriptionValue() ?? '';
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  });

  isOverLimit = computed(() => this.wordCount() > 250);

  constructor() {
    this.jobLevelForm.controls.levelOrder.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearControlError('levelOrder', 'duplicate'));
  }

  ngOnInit() {
    this.levelId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.levelId) {
      this.router.navigate(['/job-levels/view']);
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
            description: level.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load level:', error);
          this.isLoading.set(false);
          this.router.navigate(['/job-levels/view']);
        },
      });
  }

  onSubmit() {
    if (this.isLoading() || this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.trimName();
    this.clearControlError('levelOrder', 'duplicate');
    this.jobLevelForm.updateValueAndValidity();

    if (this.jobLevelForm.invalid) {
      this.jobLevelForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.jobLevelForm.getRawValue();
    const description = formData.description?.trim();
    const payload: IUpdateOrganizationLevel = {
      levelOrder: Number(formData.levelOrder),
      name: formData.name.trim(),
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
          this.router.navigate(['/job-levels/view']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Update level failed:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/job-levels/view']);
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

  private trimName() {
    const nameControl = this.jobLevelForm.controls.name;
    const trimmedName = nameControl.value.trim();

    if (nameControl.value !== trimmedName) {
      nameControl.setValue(trimmedName);
    }
  }
}
