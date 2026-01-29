import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-project-logo-component',
  imports: [NgOptimizedImage,TranslocoDirective],
  templateUrl: './project-logo-component.html',
  styleUrl: './project-logo-component.css',
  providers:[],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLogoComponent {

}
