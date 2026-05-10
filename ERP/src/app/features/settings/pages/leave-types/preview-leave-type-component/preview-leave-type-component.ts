import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { LeaveTypesService } from '@features/settings/services/leave-types-service';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';

@Component({
  selector: 'app-preview-leave-type-component',
  standalone: true,
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './preview-leave-type-component.html',
  styleUrl: './preview-leave-type-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLeaveTypeComponent implements OnInit {
  readonly descriptionCharacterLimit = 1000;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LeaveTypesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  isLoading = signal(true);

  leaveTypeForm = this.fb.group({
    code: this.fb.nonNullable.control({ value: '', disabled: true }),
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    color: this.fb.nonNullable.control({ value: '', disabled: true }),
    maxDaysPerYear: this.fb.nonNullable.control({ value: '', disabled: true }),
    maxContinuousDaysApplicable: this.fb.nonNullable.control({ value: '', disabled: true }),
    applicableAfterDays: this.fb.nonNullable.control({ value: '', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
    requiresPermission: this.fb.nonNullable.control({ value: false, disabled: true }),
    overrideWeekendOffDays: this.fb.nonNullable.control({ value: false, disabled: true }),
    allowOutsideLeavePolicy: this.fb.nonNullable.control({ value: true, disabled: true }),
    paid: this.fb.nonNullable.control({ value: true, disabled: true }),
  });

  private readonly descriptionValue = toSignal(
    this.leaveTypeForm.controls.description.valueChanges,
    { initialValue: '' },
  );

  characterCount = computed(() => (this.descriptionValue() ?? '').length);

  ngOnInit() {
    const leaveTypeId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!leaveTypeId) {
      this.goBack();
      return;
    }

    this.service
      .getById(leaveTypeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leaveType) => {
          this.breadcrumbService.setCurrentBreadcrumbLabel(leaveType.name, this.route);
          this.leaveTypeForm.patchValue({
            code: leaveType.code,
            name: leaveType.name,
            color: leaveType.color,
            maxDaysPerYear: this.toInputValue(leaveType.maxDaysPerYear),
            maxContinuousDaysApplicable: this.toInputValue(leaveType.maxContinuousDaysApplicable),
            applicableAfterDays: this.toInputValue(leaveType.applicableAfterDays),
            description: leaveType.description,
            requiresPermission: leaveType.requiresPermission,
            overrideWeekendOffDays: leaveType.overrideWeekendOffDays,
            allowOutsideLeavePolicy: leaveType.allowOutsideLeavePolicy,
            paid: leaveType.paid,
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load leave type preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/settings/leave-types']);
  }

  private toInputValue(value: number | null): string {
    return value === null || value === undefined ? '' : value.toString();
  }
}
