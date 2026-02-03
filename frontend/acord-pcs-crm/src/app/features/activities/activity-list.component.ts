import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ActivityService } from '../../core/services/activity.service';
import { Activity, PaginatedResponse } from '../../core/models';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.scss',
})
export class ActivityListComponent implements OnInit {
  private activityService = inject(ActivityService);

  activities = signal<Activity[]>([]);
  loading = signal(true);
  filterStatus = signal<string>('');
  filterType = signal<string>('');

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.activityService.list().subscribe({
      next: (response: PaginatedResponse<Activity>) => {
        this.activities.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'CALL': 'bi-telephone',
      'EMAIL': 'bi-envelope',
      'MEETING': 'bi-calendar-event',
      'TASK': 'bi-check2-square',
      'NOTE': 'bi-sticky',
      'FOLLOW_UP': 'bi-arrow-repeat',
    };
    return icons[type] || 'bi-activity';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-warning text-dark',
      'IN_PROGRESS': 'bg-info',
      'COMPLETED': 'bg-success',
      'CANCELLED': 'bg-secondary',
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityClass(priority: number | undefined): string {
    if (!priority) return '';
    if (priority >= 4) return 'border-danger';
    if (priority >= 3) return 'border-warning';
    return '';
  }

  get filteredActivities(): Activity[] {
    let result = this.activities();
    const status = this.filterStatus();
    const type = this.filterType();

    if (status) {
      result = result.filter((a) => a.activityStatus === status);
    }

    if (type) {
      result = result.filter((a) => a.activityType === type);
    }

    return result;
  }

  get overdueCount(): number {
    const now = new Date();
    return this.activities().filter((a) => {
      if (a.activityStatus === 'COMPLETED' || a.activityStatus === 'CANCELLED') return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate) < now;
    }).length;
  }

  get dueTodayCount(): number {
    const today = new Date().toDateString();
    return this.activities().filter((a) => {
      if (a.activityStatus === 'COMPLETED' || a.activityStatus === 'CANCELLED') return false;
      if (!a.dueDate) return false;
      return new Date(a.dueDate).toDateString() === today;
    }).length;
  }

  get pendingCount(): number {
    return this.activities().filter((a) => a.activityStatus === 'PENDING').length;
  }

  isOverdue(activity: Activity): boolean {
    if (!activity.dueDate) return false;
    if (activity.activityStatus === 'COMPLETED' || activity.activityStatus === 'CANCELLED') return false;
    return new Date(activity.dueDate) < new Date();
  }

  isDueToday(activity: Activity): boolean {
    if (!activity.dueDate) return false;
    return new Date(activity.dueDate).toDateString() === new Date().toDateString();
  }
}
