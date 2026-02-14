import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { PageTitleComponent } from "@shared/components/atoms/page-title-component/page-title-component";

@Component({
  selector: 'app-form-container-component',
  imports: [PageTitleComponent, TranslocoModule],
  templateUrl: './form-container-component.html',
  styleUrl: './form-container-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormContainerComponent {
title = input.required<string>();
  submit = output<void>();
}
