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
          displayName: id,
        },
    ),
  );

  availableStaff = computed(() => {
    const search = this.normalizedSearch();

    return this.staffOptions()
      .filter((option) => {
        if (this.selectedIdSet().has(option.id)) {
          return false;
        }

        return (
          !search ||
          option.displayName.toLowerCase().includes(search) ||
          option.fullNameAr.toLowerCase().includes(search) ||
          option.fullNameEn.toLowerCase().includes(search)
        );
      })
      .slice(0, 8);
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
}
