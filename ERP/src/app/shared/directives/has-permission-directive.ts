import { Directive, effect, inject, input } from '@angular/core';
import { AuthService } from '@core/auth/services/auth-service';

@Directive({
  selector: '[appHasPermissionDirective]',
})
export class HasPermissionDirective {
private authService = inject(AuthService);
permission = input.required<string>({ alias: 'appHasPermission' });

  constructor() {
    effect(() => {
      const userPermissions = this.authService.currentUser()?.permissions || [];
      const hasAccess = userPermissions.includes(this.permission());
      // استخدام Renderer2 لإخفاء العنصر إذا لم تتوفر الصلاحية
    });
  }

}
