import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { AuthService } from '@core/auth/services/auth-service';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-login-form-component',
  imports: [ReactiveFormsModule, TranslocoModule, AppInputComponent, AppBtnComponent,NgIcon],
  templateUrl: './login-form-component.html',
  styleUrl: './login-form-component.css',
  providers:[provideIcons({lucideOctagonX})],
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
    this.serverError.set(null);

    if (this.loginForm.invalid) {
    return;
  }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err:string) => {
        this.isLoading.set(false);
        //toast with err message
        this.serverError.set(err);
        console.error("Login Error Details:", err);
      }
    });

  }
}
