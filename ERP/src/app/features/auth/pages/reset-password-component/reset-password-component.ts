import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { TranslocoModule } from '@jsverse/transloco';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import {  provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";
import { SubmitErrorMessageComponent } from "@shared/components/atoms/submit-error-message-component/submit-error-message-component";

@Component({
  selector: 'app-reset-password-component',
  imports: [AppInputComponent, AppBtnComponent, ReactiveFormsModule, TranslocoModule, AuthPromptComponent, SubmitErrorMessageComponent],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
  providers:[provideIcons({lucideOctagonX})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
private fb = inject(NonNullableFormBuilder);

isLoading = signal(false);
submitted = signal(false);

// البيانات القادمة من الخطوات السابقة (يمكن تخزينها في Service أو Route State)
userData = signal({ userId: '3fa8...', resetToken: 'string' });

resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: [passwordMatchValidator] });

  async onSubmit() {
    this.submitted.set(true);
    if (this.resetForm.invalid) return;

    this.isLoading.set(true);
    // تنفيذ POST/api/account/reset-password باستخدام الخدمة
  }

}
