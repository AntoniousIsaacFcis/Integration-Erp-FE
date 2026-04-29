import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '@core/auth/services/auth-service';
import { AccessRuleInput, canAccess } from '@core/auth/utils/access-control';

@Directive({
  selector: '[appCanAccess]',
})
export class CanAccessDirective {
  private readonly authService = inject(AuthService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef);

  rule = input.required<AccessRuleInput>({ alias: 'appCanAccess' });

  constructor() {
    effect(() => {
      this.vcr.clear();

      if (canAccess(this.authService, this.rule())) {
        this.vcr.createEmbeddedView(this.templateRef);
      }
    });
  }
}
