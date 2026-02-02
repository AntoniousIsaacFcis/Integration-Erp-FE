import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/organisms/header/header-component';
import { SidebarComponent } from '@shared/components/organisms/sidebar-component/sidebar-component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-main-layout-component',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet, TranslocoModule],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class MainLayoutComponent {
  isSidebarExpanded = signal<boolean>(true);

  toggleSidebar() {
    this.isSidebarExpanded.update(v => !v);
  }
}
