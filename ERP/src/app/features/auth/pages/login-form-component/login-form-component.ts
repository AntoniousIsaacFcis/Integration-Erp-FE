import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";

@Component({
  selector: 'app-login-form-component',
  imports: [ReactiveFormsModule, TranslocoModule, AppInputComponent, AppBtnComponent],
  templateUrl: './login-form-component.html',
  styleUrl: './login-form-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
private fb = inject(NonNullableFormBuilder);

isLoading = signal(false);

loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const credentials = this.loginForm.getRawValue();
      console.log('Logging in with:', credentials);
      // الخطوة القادمة: ربط هذا بـ rxResource و AuthService
    }else {
    this.loginForm.markAllAsTouched();
  }
  }
}
