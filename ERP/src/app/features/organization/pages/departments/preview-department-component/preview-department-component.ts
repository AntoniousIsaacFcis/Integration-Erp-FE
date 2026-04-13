import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentsService } from '@features/organization/services/departments-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppRadioComponent } from '@shared/components/atoms/app-radio-component/app-radio-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';

@Component({
  selector: 'app-preview-department-component',
  imports: [
    TranslocoModule,
    ReactiveFormsModule,
    FormContainerComponent,
    AppInputComponent,
    AppRadioComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
  ],
  templateUrl: './preview-department-component.html',
  styleUrl: './preview-department-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDepartmentComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;
  private readonly fb = inject(FormBuilder);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(true);

  departmentForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    status: this.fb.nonNullable.control<'active' | 'inactive'>({ value: 'active', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  private descriptionValue = toSignal(this.departmentForm.controls.description.valueChanges, {
    initialValue: '',
  });

  characterCount = computed(() => (this.descriptionValue() ?? '').length);

  ngOnInit() {
    const departmentId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!departmentId) {
      this.goBack();
      return;
    }

    this.departmentsService
      .getById(departmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (department) => {
          this.departmentForm.patchValue({
            name: department.name,
            status: department.status,
            description: department.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load department preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/organization/departments/view']);
  }
}
