import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { EmploymentTypesService } from '@features/organization/services/employment-types-service';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";

@Component({
  selector: 'app-preview-employment-type-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    AppRadioComponent,
  ],
  templateUrl: './preview-employment-type-component.html',
  styleUrl: './preview-employment-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewEmploymentTypeComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly employmentTypesService = inject(EmploymentTypesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(true);

  employmentTypeForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    status: this.fb.nonNullable.control<'active' | 'inactive'>({ value: 'active', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  private descriptionValue = toSignal(this.employmentTypeForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => (this.descriptionValue() ?? '').length);

  ngOnInit() {
    const employmentTypeId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!employmentTypeId) {
      this.goBack();
      return;
    }

    this.employmentTypesService
      .getById(employmentTypeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (type) => {
          this.employmentTypeForm.patchValue({
            name: type.name,
            status: type.status,
            description: type.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load employment type preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/organization/employment-types/view']);
  }
}
