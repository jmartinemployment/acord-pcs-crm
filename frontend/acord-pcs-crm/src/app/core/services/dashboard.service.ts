import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardOverview, DashboardStats, RenewalPipeline, ClaimsSummary, TaskSummary, LeadPipeline, Activity } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(ApiService);

  getOverview(): Observable<DashboardOverview> {
    return this.api.get<DashboardOverview>('/dashboard/overview');
  }

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getRenewals(days = 90): Observable<RenewalPipeline> {
    return this.api.get<RenewalPipeline>('/dashboard/renewals', { days });
  }

  getClaims(): Observable<ClaimsSummary> {
    return this.api.get<ClaimsSummary>('/dashboard/claims');
  }

  getTasks(): Observable<TaskSummary> {
    return this.api.get<TaskSummary>('/dashboard/tasks');
  }

  getPipeline(): Observable<LeadPipeline> {
    return this.api.get<LeadPipeline>('/dashboard/pipeline');
  }

  getActivity(limit = 20): Observable<Activity[]> {
    return this.api.get<Activity[]>('/dashboard/activity', { limit });
  }
}
