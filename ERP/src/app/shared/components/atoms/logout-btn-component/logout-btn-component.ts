import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';

@Component({
  selector: 'app-logout-btn-component',
  imports: [NgIcon, TranslocoModule],
  templateUrl: './logout-btn-component.html',
  styleUrl: './logout-btn-component.css',
  providers: [provideIcons({ lucideLogOut })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutBtnComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  handleLogout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logout successful, redirecting...');
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      },
      error: (err) => console.error('❌ Logout failed', err)
    });
  }
}
