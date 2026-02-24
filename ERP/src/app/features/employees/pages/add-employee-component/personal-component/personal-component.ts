import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPersonalInfo } from '@features/employees/models/ipersonal-info';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight } from '@ng-icons/lucide';
import { FormContainerComponent } from "@shared/components/organisms/form-container-component/form-container-component";
import { AppInputComponent } from "@shared/components/atoms/app-input-component/app-input-component";
import { AppSelectComponent } from "@shared/components/atoms/app-select-component/app-select-component";
import { AppDateInputComponent } from "@shared/components/atoms/app-date-input-component/app-date-input-component";

@Component({
  selector: 'app-personal-component',
  imports: [FormContainerComponent, TranslocoModule, ReactiveFormsModule, NgIcon, AppInputComponent, AppSelectComponent, AppDateInputComponent],
  templateUrl: './personal-component.html',
  styleUrl: './personal-component.css',
  providers: [provideIcons({ lucideArrowLeft, lucideArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalComponent {
  next = output<Partial<IPersonalInfo>>(); //partial as can send some information only in current step
  private fb = inject(FormBuilder);

  submitted = signal(false);//for control showing validation error messags only when submit

  personalForm = this.fb.nonNullable.group({
    fullNameAr: ['', [Validators.required]],
    fullNameEn: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    nationalId: ['', [Validators.required, Validators.pattern('^[0-9]{10,14}$')]],
    nationality: ['', [Validators.required]],
    birthDate: ['', [Validators.required]],
    maritalStatus: ['', [Validators.required]],
    birthPlace: [''],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
    emergencyContact: ['', [Validators.required]]
  });

  getControl(name: string): FormControl {
    return this.personalForm.get(name) as FormControl;
  }

  onStepSubmit() {
    this.submitted.set(true);

    if (this.personalForm.valid) {
      this.next.emit(this.personalForm.getRawValue() as IPersonalInfo);
    } else {
      this.personalForm.markAllAsTouched();
    }
  }

  nationalities = signal([
  { code: 'SA', name: 'SAUDI' },
  { code: 'EG', name: 'EGYPTIAN' },
  { code: 'JO', name: 'JORDANIAN' },
  { code: 'AE', name: 'EMIRATI' },
  { code: 'KW', name: 'KUWAITI' },
  // يمكن توسيع القائمة أو جلبها من API لاحقاً باستخدام rxResource
]);
}
