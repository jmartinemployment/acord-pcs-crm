import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  authService = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Parties', icon: 'bi-people', route: '/parties' },
    { label: 'Policies', icon: 'bi-file-earmark-text', route: '/policies' },
    { label: 'Claims', icon: 'bi-exclamation-triangle', route: '/claims' },
    { label: 'Surety Bonds', icon: 'bi-building', route: '/bonds' },
    { label: 'Leads', icon: 'bi-funnel', route: '/leads' },
    { label: 'Activities', icon: 'bi-calendar-check', route: '/activities' },
  ];

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
