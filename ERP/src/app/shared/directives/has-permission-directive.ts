import { Directive, effect, ElementRef, inject, input, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '@core/auth/services/auth-service';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private vcr = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  // Use the modern signal input
  permission = input.required<string>({ alias: 'appHasPermission' });
  elseTemplate = input<TemplateRef<any>>();

  constructor() {
    const authService = inject(AuthService);
    const vcr = inject(ViewContainerRef);
    const templateRef = inject(TemplateRef);
    effect(() => {
      vcr.clear();
      if (authService.hasPermission(this.permission())) {
        vcr.createEmbeddedView(templateRef);
      } else if (this.elseTemplate()) {
        vcr.createEmbeddedView(this.elseTemplate()!);
      }
    });
  }
}


