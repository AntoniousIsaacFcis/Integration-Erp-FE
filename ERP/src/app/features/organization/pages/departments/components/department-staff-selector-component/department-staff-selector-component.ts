import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { IDepartmentStaffOption } from '@features/organization/models/idepartment';

@Component({
  selector: 'app-department-staff-selector-component',
  imports: [TranslocoModule, NgIcon],
  templateUrl: './department-staff-selector-component.html',
  styleUrl: './department-staff-selector-component.css',
  providers: [provideIcons({ lucideSearch, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentStaffSelectorComponent {
  private readonly maxVisibleSelectedStaff = 4;
  private readonly maxVisibleAvailableStaff = 4;

  label = input.required<string>();
  placeholder = input<string>('ORGANIZATION.SEARCH_STAFF');
  selectedIds = input<string[]>([]);
  staffOptions = input<IDepartmentStaffOption[]>([]);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  isLoading = input<boolean>(false);

  selectedIdsChange = output<string[]>();

  readonly searchTerm = signal('');

  private readonly normalizedSearch = computed(() => this.searchTerm().trim().toLowerCase());
  private readonly selectedIdSet = computed(() => new Set(this.selectedIds()));
  private readonly staffMap = computed(
    () => new Map(this.staffOptions().map((option) => [option.id, option])),
  );

  selectedStaff = computed(() =>
    this.selectedIds().map(
      (id) =>
        this.staffMap().get(id) ?? {
          id,
          fullNameAr: id,
          fullNameEn: id,
          fullName: id,
          displayName: id,
          staffCode: '',
          phone: '',
          mobileNumber: '',
        },
    ),
  );

  visibleSelectedStaff = computed(() => this.selectedStaff().slice(-this.maxVisibleSelectedStaff));
  hiddenSelectedCount = computed(() =>
    Math.max(this.selectedStaff().length - this.maxVisibleSelectedStaff, 0),
  );

  availableStaff = computed(() => {
    const search = this.normalizedSearch();

    return this.staffOptions()
      .filter((option) => {
        if (this.selectedIdSet().has(option.id)) {
          return false;
        }

        return !search || this.matchesSearch(option, search);
      })
      .slice(0, this.maxVisibleAvailableStaff);
  });

  updateSearchTerm(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  addStaff(optionId: string) {
    if (this.disabled() || this.selectedIdSet().has(optionId)) {
      return;
    }

    this.selectedIdsChange.emit([...this.selectedIds(), optionId]);
    this.searchTerm.set('');
  }

  removeStaff(optionId: string) {
    if (this.disabled()) {
      return;
    }

    this.selectedIdsChange.emit(this.selectedIds().filter((id) => id !== optionId));
  }

  getStaffMeta(option: IDepartmentStaffOption) {
    return [option.staffCode && `#${option.staffCode}`, option.mobileNumber, option.phone]
      .filter(Boolean)
      .join(' | ');
  }

  private matchesSearch(option: IDepartmentStaffOption, search: string) {
    return [
      option.displayName,
      option.fullName,
      option.fullNameAr,
      option.fullNameEn,
      option.staffCode,
      option.mobileNumber,
      option.phone,
    ].some((value) => value.toLowerCase().includes(search));
  }
}
