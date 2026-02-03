import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DashboardOverview } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, NavbarComponent, StatsCardComponent, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  data = signal<DashboardOverview | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.getOverview().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      OPEN: 'bg-warning',
      CLOSED: 'bg-success',
      DENIED: 'bg-danger',
      SUBROGATION: 'bg-info',
      LITIGATION: 'bg-dark',
    };
    return classes[status] || 'bg-secondary';
  }

  getLeadPercent(status: string): number {
    const data = this.data();
    if (!data || !data.leads.byStatus) return 0;
    const total = data.leads.byStatus.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return 0;
    const found = data.leads.byStatus.find(s => s.status === status);
    return Math.max(10, ((found?.count || 0) / total) * 100);
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      CALL: 'bi-telephone',
      EMAIL: 'bi-envelope',
      MEETING: 'bi-calendar-event',
      TASK: 'bi-check-square',
      NOTE: 'bi-sticky',
      FOLLOW_UP: 'bi-arrow-repeat',
    };
    return icons[type] || 'bi-circle';
  }
}
