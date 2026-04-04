import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

// Transloco
import { TranslocoModule } from '@jsverse/transloco';

// Services
import { RoleService } from '@features/role/services/role-service';

// Models
import { ICreateRoleRequest, IPermissionCategory } from '@features/role/models/irole';

// Components
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppSelectComponent } from '@shared/components/atoms/app-select-component/app-select-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { PermissionChipComponent } from '@features/role/components/permission-chip-component/permission-chip-component';

// Validators
import { AppValidators } from '@shared/validators/word-limit.validator';

@Component({
  selector: 'app-create-role-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslocoModule,
    FormContainerComponent,
    AppInputComponent,
    AppSelectComponent,
    AppTextareaComponent,
    FormCancelButtonComponent,
    FormSaveButtonComponent,
    PermissionChipComponent,
  ],
  templateUrl: './create-role-component.html',
  styleUrl: './create-role-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoleComponent {
  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // Form state
  isFormSubmitted = signal(false);
  isSubmitting = signal(false);
  selectedPermissionKeys = signal<string[]>([]);

  // Load permissions schema
  permissionsResource = rxResource({
    params: () => ({}),
    stream: () => {
      if (!isPlatformBrowser(this.platformId)) {
        return of([]);
      }
      return this.roleService.getPermissionsSchema();
    },
  });

  // Save resource
  saveResource = rxResource({
    params: () => this.isSubmitting(),
    stream: ({ params }) =>
      params ? this.roleService.createRole(this.mainForm.getRawValue() as ICreateRoleRequest) : of(null),
  });

  // Form definition
  mainForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    type: ['', [Validators.required]],
    status: ['active', [Validators.required]],
    description: ['', [AppValidators.wordLimit(100)]],
    permissions: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  // Computed: Word count for description
  private descriptionValue = toSignal(this.mainForm.controls.description.valueChanges, {
    initialValue: '',
  });

  descriptionWordCount = computed(() => {
    const text = this.descriptionValue() ?? '';
    return text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length;
  });

  isDescriptionOverLimit = computed(() => this.descriptionWordCount() > 100);

  // Form controls helpers
  get nameControl() {
    return this.mainForm.controls.name;
  }

  get typeControl() {
    return this.mainForm.controls.type;
  }

  get statusControl() {
    return this.mainForm.controls.status;
  }

  get descriptionControl() {
    return this.mainForm.controls.description;
  }

  // Methods
  togglePermission(key: string) {
    const current = this.selectedPermissionKeys();
    const updated = current.includes(key) ? current.filter(k => k !== key) : [...current, key];

    this.selectedPermissionKeys.set(updated);
    this.mainForm.controls.permissions.setValue(updated);
    this.mainForm.controls.permissions.markAsTouched();
  }

  onSubmit() {
    if (this.isSubmitting()) return;

    this.isFormSubmitted.set(true);
    this.mainForm.updateValueAndValidity();

    if (this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call completion
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.router.navigate(['/roles']);
    }, 1000);
  }

  onCancel() {
    this.router.navigate(['/roles']);
  }
}
