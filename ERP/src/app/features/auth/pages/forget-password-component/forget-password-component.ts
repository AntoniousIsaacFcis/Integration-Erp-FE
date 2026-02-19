import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";
import { provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-forget-password-component',
  imports: [TranslocoModule, AppInputComponent, AppBtnComponent, AuthPromptComponent, ReactiveFormsModule],
  templateUrl: './forget-password-component.html',
  styleUrl: './forget-password-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgetPasswordComponent {
  private fb = inject(NonNullableFormBuilder);

  otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput'); //Signal-based ViewChildren

  step = signal<'email' | 'otp'>('email');
  isLoading = signal(false);
  submitted = signal(false);

  constructor() { //if otp => focus first box
    effect(() => {
      if (this.step() === 'otp') {
        setTimeout(() => {
          this.otpInputs()[0]?.nativeElement.focus();
        }, 0);
      }
    });
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    //when enter a letter , go to next
    if (value && index < this.otpInputs().length - 1) {
      this.otpInputs()[index + 1].nativeElement.focus();
    }
  }

  onBackspace(index: number) {
    const inputs = this.otpInputs();
    const currentInput = inputs[index].nativeElement;

    if (!currentInput.value && index > 0) {
      const prevInput = this.otpInputs()[index - 1].nativeElement;
      prevInput.focus();
    }
  }
  forgetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmitEmail() {
    this.submitted.set(true);
    if (this.forgetForm.invalid) return;

    this.isLoading.set(true);
    // server simulation
    setTimeout(() => {
      this.isLoading.set(false);
      this.step.set('otp'); // go to next step of otp
      this.submitted.set(false);
    }, 1000);
  }


}
