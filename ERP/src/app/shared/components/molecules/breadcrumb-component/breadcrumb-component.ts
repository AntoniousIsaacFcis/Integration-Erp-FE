import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IBreadrump } from '@core/models/ibreadrump';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { TranslationService } from '@core/services/translation-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-breadcrumb-component',
  imports: [TranslocoModule,RouterLink,NgIcon],
  templateUrl: './breadcrumb-component.html',
  styleUrl: './breadcrumb-component.css',
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  protected breadcrumbService = inject(BreadcrumbService);
  private translationService = inject(TranslationService);



 protected readonly items = this.breadcrumbService.items;

  protected readonly dir = computed(() => this.translationService.lang() === 'ar' ? 'rtl' : 'ltr');
}
