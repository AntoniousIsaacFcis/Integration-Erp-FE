import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/organisms/header/header-component';
import { SidebarComponent } from '@shared/components/organisms/sidebar-component/sidebar-component';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent } from "@shared/components/molecules/breadcrumb-component/breadcrumb-component";
import { FooterComponent } from "@shared/components/organisms/footer-component/footer-component";
import { IBreadrump } from '@core/models/ibreadrump';

@Component({
  selector: 'app-main-layout-component',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet, TranslocoModule, BreadcrumbComponent, FooterComponent],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class MainLayoutComponent {
  isSidebarExpanded = signal(true);

  toggleSidebar() {
    this.isSidebarExpanded.update(v => !v);
  }
}
