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

  constructor() {
    effect(() => {
      const hasAccess = this.authService.hasPermission(this.permission());

      this.vcr.clear();
      if (hasAccess) {
        this.vcr.createEmbeddedView(this.templateRef);
      }
    });
  }
}


