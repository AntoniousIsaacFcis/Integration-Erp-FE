import { Component } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/organisms/page-header-component/page-header-component";
import { FiltersBarComponent } from "@shared/components/molecules/filters-bar-component/filters-bar-component";
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-level-mapping-component',
  imports: [PageHeaderComponent, FiltersBarComponent, StatusBadgeComponent, ActionBtnComponent,TranslocoModule],
  templateUrl: './level-mapping-component.html',
  styleUrl: './level-mapping-component.css',
})
export class LevelMappingComponent {

}
