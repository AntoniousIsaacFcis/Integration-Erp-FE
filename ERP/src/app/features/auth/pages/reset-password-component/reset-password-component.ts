import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { TranslocoModule } from '@jsverse/transloco';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";
import { SubmitErrorMessageComponent } from "@shared/components/atoms/submit-error-message-component/submit-error-message-component";
import { NotificationService } from '@core/services/notification-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-component',
  imports: [AppInputComponent, AppBtnComponent, ReactiveFormsModule, TranslocoModule, AuthPromptComponent, SubmitErrorMessageComponent],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

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

    setTimeout(() => {
      const isWeakPassword = this.resetForm.getRawValue().password === '12345';

      if (isWeakPassword) {
        this.isLoading.set(false);
        this.notificationService.show({
          type: 'error',
          title: 'AUTH.ERRORS.PASSWORD_TOO_WEAK',
          isModal: false, //toast
          actionLabel:''
        });
      } else {
        this.isLoading.set(false);

        this.notificationService.show({
          type: 'success',
          isModal: true,
          title: 'AUTH.PASSWORD_RESET_SUCCESS',
          // message: 'AUTH.LOGIN_WITH_NEW_PASSWORD',
          actionLabel: 'AUTH.LOGIN'
        });

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1000);
      }
    }, 1500);
  }
}
