import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { TranslocoModule } from '@jsverse/transloco';
import { HolidayListsService } from '@features/settings/services/holiday-lists-service';
import { IHolidayList, IHolidayListDay } from '@features/settings/models/iholiday-list';
import { FormContainerComponent } from '@shared/components/organisms/form-container-component/form-container-component';
import { AppInputComponent } from '@shared/components/atoms/app-input-component/app-input-component';
import { FormSaveButtonComponent } from '@shared/components/molecules/form-save-button-component/form-save-button-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';

@Component({
  selector: 'app-preview-holiday-list-component',
  standalone: true,
  imports: [
    TranslocoModule,
    FormContainerComponent,
    ReactiveFormsModule,
    AppInputComponent,
    FormSaveButtonComponent,
    TableStatusBadgeComponent,
  ],
  templateUrl: './preview-holiday-list-component.html',
  styleUrl: './preview-holiday-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewHolidayListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(HolidayListsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breadcrumbService = inject(BreadcrumbService);

  isLoading = signal(true);
  holidayList = signal<IHolidayList | null>(null);

  holidayListForm = this.fb.group({
    name: this.fb.nonNullable.control({ value: '', disabled: true }),
    totalDays: this.fb.nonNullable.control({ value: '', disabled: true }),
  });

  days = computed<IHolidayListDay[]>(() => this.holidayList()?.days ?? []);

  ngOnInit() {
    const holidayListId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!holidayListId) {
      this.goBack();
      return;
    }

    this.service
      .getById(holidayListId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (holidayList) => {
          this.holidayList.set(holidayList);
          this.holidayListForm.patchValue({
            name: holidayList.name,
            totalDays: String(holidayList.totalDays ?? holidayList.days.length),
          });
          this.breadcrumbService.setCurrentBreadcrumbLabel(holidayList.name, this.route);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load holiday list preview:', error);
          this.goBack();
        },
      });
  }

  goBack() {
    this.router.navigate(['/settings/holiday-lists']);
  }
}
