import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IDepartment } from '@features/job-level/models/idepartment';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { delay, finalize, of } from 'rxjs';
import { environment } from '@env/environment.development';
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";
import { FormCancelButtonComponent } from "@shared/components/molecules/form-cancel-button-component/form-cancel-button-component";
import { JobLevelService } from '@features/job-level/service/job-level-service';
import { Router } from '@angular/router';
import { AppValidators } from '@shared/validators/word-limit.validator';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppRadioComponent } from "@shared/components/atoms/app-radio-component/app-radio-component";
import { AppTextareaComponent } from "@shared/components/atoms/app-textarea-component/app-textarea-component";
import { DepartmentsService } from '@features/departments/services/departments-service';

@Component({
  selector: 'app-create-level-component',
  imports: [TranslocoModule, FormContainerComponent, ReactiveFormsModule, FormSaveButtonComponent, FormCancelButtonComponent, AppInputComponent, AppSelectComponent, AppRadioComponent, AppTextareaComponent],
  templateUrl: './create-level-component.html',
  styleUrl: './create-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLevelComponent {
  private readonly fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private _jobLevelService = inject(JobLevelService)
  private readonly _translocoService = inject(TranslocoService);
  private readonly _departmentService = inject(DepartmentsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);//to kill create request if browser closed
  protected platformId = inject(PLATFORM_ID);

  departmentsResource = rxResource({
    params: () => ({}),
    stream: () => {
      if (!isPlatformBrowser(this.platformId)) {
        return of([]);
      }
      return this.http.get<IDepartment[]>(`${environment.baseUrl}/api/departments`);
    }
  });
  departments = this._departmentService.localizedDepartments;

  isSubmitting = signal(false);
  isLoadingDepartments = this._departmentService.departmentsResource.isLoading;

  jobLevelForm = this.fb.group({
    nameAr: ['', [Validators.required]],
    departmentId: ['', [Validators.required]],
    status: ['active', [Validators.required]],
    description: ['', [AppValidators.wordLimit(250)]]
  });

  isFormSubmitted = signal(false);
  onSubmit() {
    this.isFormSubmitted.set(true);
    this.jobLevelForm.updateValueAndValidity();

    if (this.jobLevelForm.invalid) {
      this.jobLevelForm.markAllAsTouched();
      console.warn('Form is invalid, submission blocked.');
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.jobLevelForm.getRawValue();

    this._jobLevelService.create(formData as any)
      .pipe(
        takeUntilDestroyed(this.destroyRef))
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
        }
      });
  }
  onCancel() {
    this.isFormSubmitted.set(false);
    this.jobLevelForm.reset({
      status: 'active',
      departmentId: '',
      description: ''
    });
  }
}
