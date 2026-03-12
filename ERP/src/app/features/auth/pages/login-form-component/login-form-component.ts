import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { AuthService } from '@core/auth/services/auth-service';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";
import { SubmitErrorMessageComponent } from "@shared/components/atoms/submit-error-message-component/submit-error-message-component";
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login-form-component',
  imports: [ReactiveFormsModule, TranslocoModule, AppInputComponent, AppBtnComponent, AuthPromptComponent, SubmitErrorMessageComponent],
  templateUrl: './login-form-component.html',
  styleUrl: './login-form-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  isLoading = signal(false);
  submitted = signal(false);
  serverError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required]],//, Validators.email
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    this.submitted.set(true); // to show client side validation

    if (this.loginForm.invalid) return;

    this.isLoading.set(true);

    this.serverError.set(null);

    this.authService.login(this.loginForm.getRawValue()).pipe(
      finalize(() => this.isLoading.set(false))
    )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        },
        error: (err: string) => {
          this.isLoading.set(false);
          //toast with err message
          this.serverError.set(err);
          console.error("Login Error Details:", err);
        }
      });

  }
}
