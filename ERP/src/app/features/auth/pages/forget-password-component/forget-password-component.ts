import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppBtnComponent } from "@shared/components/atoms/app-btn-component/app-btn-component";
import { AuthPromptComponent } from "@shared/components/atoms/auth-prompt-component/auth-prompt-component";
import { provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';
import { NotificationService } from '@core/services/notification-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password-component',
  imports: [TranslocoModule, AppInputComponent, AppBtnComponent, AuthPromptComponent, ReactiveFormsModule],
  templateUrl: './forget-password-component.html',
  styleUrl: './forget-password-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgetPasswordComponent {
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private notificationService = inject(NotificationService);

  otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');//using viewchideren to catch dom elments
  private digits = [signal(''), signal(''), signal(''), signal(''), signal('')];

  step = signal<'email' | 'otp'>('email');
  timeLeft = signal(60);
  isLoading = signal(false);
  submitted = signal(false);

  // --- Forms Definitions ---
  forgetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // --- Computed States ---
  otpValue = computed(() => this.digits.map(d => d()).join(''));
  isOtpComplete = computed(() => this.otpValue().length === 5);
  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    // auto Focus logic using effect
    effect(() => {
      if (this.step() === 'otp') {
        setTimeout(() => this.otpInputs()[0]?.nativeElement.focus(), 0);
      }
    });

    // Timer logic
    effect((onCleanup) => {
      if (this.step() === 'otp' && this.timeLeft() > 0) {
        const interval = setInterval(() => this.timeLeft.update(v => v - 1), 1000);
        onCleanup(() => clearInterval(interval));
      }
    });
  }

  // --- Actions ---
  onSubmitEmail() {
    this.submitted.set(true);
    if (this.forgetForm.invalid) return;

    this.isLoading.set(true);
    // Simulation
    setTimeout(() => {
      this.isLoading.set(false);
      this.notificationService.show({
        type: 'success',
        isModal: true,
        title: 'AUTH.SUCCESS_TITLE',
        actionLabel: 'OK'
      });
      this.step.set('otp');
      this.submitted.set(false);
    }, 1000);
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.slice(-1);

    if (val && !/^\d+$/.test(val)) {
      input.value = '';
      return;
    }

    this.digits[index].set(val);

    if (val && index < 4) {
      this.otpInputs()[index + 1].nativeElement.focus();
    }

    if (this.isOtpComplete()) {
      this.verifyOtp(this.otpValue());
    }
  }

  onBackspace(index: number) {
    if (!this.digits[index]() && index > 0) {
      const prevInput = this.otpInputs()[index - 1].nativeElement;
      prevInput.focus();
      this.digits[index - 1].set('');
      prevInput.value = '';
    } else {
      this.digits[index].set('');
    }
  }

  async verifyOtp(code: string) {
    if (this.isLoading() || code.length < 5) return;

    this.isLoading.set(true);
    setTimeout(() => {
      if (code === '12345') {
        this.notificationService.show({
          type: 'success',
          title: 'AUTH.OTP_VERIFIED',
          actionLabel: 'OK'
        });
        setTimeout(() => {
          this.isLoading.set(false);
          this.router.navigate(['/auth/reset-password']);
        }, 1500);
      } else {
        this.isLoading.set(false);
        this.notificationService.show({
           type: 'error',
            title: 'AUTH.INVALID_CODE',
            actionLabel:'AUTH.CLOSING'
          });
        this.clearOtpInputs();
      }
    }, 1000);
  }

  private clearOtpInputs() {
    this.digits.forEach(d => d.set(''));
    this.otpInputs().forEach(input => input.nativeElement.value = '');
    this.otpInputs()[0]?.nativeElement.focus();
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData?.getData('text').trim();
    if (data && /^\d+$/.test(data)) {
      const chars = data.split('').slice(0, 5);
      chars.forEach((char, i) => {
        this.digits[i].set(char);
        const input = this.otpInputs()[i]?.nativeElement;
        if (input) input.value = char;
        if (i < 4) this.otpInputs()[i + 1]?.nativeElement.focus();
      });
    }
  }

  resendCode() {
    if (this.timeLeft() === 0) this.timeLeft.set(60);
  }
}
