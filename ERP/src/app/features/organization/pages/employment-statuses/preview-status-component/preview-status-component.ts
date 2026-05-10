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
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { EmploymentStatusesService } from '@features/organization/services/employment-statuses-service';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';

@Component({
  selector: 'app-preview-status-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    AppRadioComponent,
  ],
  templateUrl: './preview-status-component.html',
  styleUrl: './preview-status-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewStatusComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly employmentStatusesService = inject(EmploymentStatusesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  isLoading = signal(true);

  employmentStatusForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    isActive: this.fb.nonNullable.control<boolean>({ value: true, disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  private descriptionValue = toSignal(this.employmentStatusForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => (this.descriptionValue() ?? '').length);

  ngOnInit() {
    const employmentStatusId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!employmentStatusId) {
      this.goBack();
      return;
    }

    this.employmentStatusesService
      .getById(employmentStatusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (status) => {
          this.breadcrumbService.setCurrentBreadcrumbLabel(status.name, this.route);
          this.employmentStatusForm.patchValue({
            name: status.name,
            isActive: status.isActive,
            description: status.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load employment status preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/organization/employment-statuses/view']);
  }
}
