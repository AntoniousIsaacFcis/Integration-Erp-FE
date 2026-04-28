import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { DesignationsService } from '@features/organization/services/designations-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';

@Component({
  selector: 'app-preview-designation-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    AppSelectComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    AppRadioComponent,
  ],
  templateUrl: './preview-designation-component.html',
  styleUrl: './preview-designation-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDesignationComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly designationsService = inject(DesignationsService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  isLoading = signal(true);

  designationForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    departmentId: this.fb.nonNullable.control({ value: '', disabled: true }),
    status: this.fb.nonNullable.control<'active' | 'inactive'>({ value: 'active', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  private descriptionValue = toSignal(this.designationForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => (this.descriptionValue() ?? '').length);
  departmentOptions = this.departmentsService.selectList;
  isLoadingDepartments = this.departmentsService.selectResource.isLoading;

  ngOnInit() {
    const designationId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!designationId) {
      this.goBack();
      return;
    }

    this.designationsService
      .getById(designationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (designation) => {
          this.breadcrumbService.setCurrentBreadcrumbLabel(designation.name, this.route);
          this.designationForm.patchValue({
            name: designation.name,
            departmentId: designation.departmentId ?? '',
            status: designation.status,
            description: designation.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load designation preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/organization/designations/view']);
  }
}
