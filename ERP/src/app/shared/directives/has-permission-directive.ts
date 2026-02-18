import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { AuthService } from '@core/auth/services/auth-service';

@Directive({
  selector: '[appHasPermissionDirective]',
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  permission = input.required<string>({ alias: 'appHasPermission' });

  constructor() {
    effect(() => {
      const policies = this.authService.grantedPolicies();
      const hasAccess = !!policies[this.permission()];

      if (hasAccess) {
        this.renderer.setStyle(this.el.nativeElement, 'display', '');
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none'); 
      }
    });
  }

}
