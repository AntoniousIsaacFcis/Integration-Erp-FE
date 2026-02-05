import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { PageHeaderComponent } from "@shared/components/organisms/page-header-component/page-header-component";

@Component({
  selector: 'app-create-level-component',
  imports: [PageHeaderComponent,TranslocoModule],
  templateUrl: './create-level-component.html',
  styleUrl: './create-level-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLevelComponent {

}
