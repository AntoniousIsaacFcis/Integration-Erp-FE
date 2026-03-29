import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-paginagtion-component',
  imports: [NgIcon, TranslocoModule],
  templateUrl: './paginagtion-component.html',
  styleUrl: './paginagtion-component.css',
  providers: [provideIcons({ lucideChevronRight,lucideChevronLeft })],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class PaginagtionComponent {
  totalItems = input.required<number>();
  pageSize = input(10);
  currentPage = model(1);//modal for two binding with signal
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  displayedPages = computed<(number | string)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    pages.push(1);
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    if (total > 1) pages.push(total);

    return pages;
  });

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
