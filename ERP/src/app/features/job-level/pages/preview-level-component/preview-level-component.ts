import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobLevelService } from '@features/job-level/service/job-level-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { AppTextareaComponent } from '@shared/components/atoms/app-textarea-component/app-textarea-component';
import { FormCancelButtonComponent } from '@shared/components/molecules/form-cancel-button-component/form-cancel-button-component';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormSaveButtonComponent } from "@shared/components/molecules/form-save-button-component/form-save-button-component";

@Component({
  selector: 'app-preview-level-component',
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
        AppInputComponent,
    AppTextareaComponent,
    FormSaveButtonComponent
],
  templateUrl: './preview-level-component.html',
  styleUrl: './preview-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewLevelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jobLevelService = inject(JobLevelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(true);

  jobLevelForm = this.fb.group({
    levelOrder: this.fb.control<number | null>({ value: null, disabled: true }),
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    description: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  private descriptionValue = toSignal(this.jobLevelForm.controls.description.valueChanges, {
    initialValue: '',
  });

  wordCount = computed(() => {
    const text = this.descriptionValue() ?? '';
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  });

  ngOnInit() {
    const levelId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!levelId) {
      this.goBack();
      return;
    }

    this.jobLevelService
      .getById(levelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (level) => {
          this.jobLevelForm.patchValue({
            levelOrder: level.levelOrder,
            name: level.name,
            description: level.description ?? '',
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load level preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/job-levels/view']);
  }
}
