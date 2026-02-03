import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Activity, PaginatedResponse } from '../models';

export interface ActivityQuery {
  page?: number;
  pageSize?: number;
  activityType?: string;
  activityStatus?: string;
  partyId?: string;
  policyId?: string;
  claimId?: string;
  assignedTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private api = inject(ApiService);

  list(query?: ActivityQuery): Observable<PaginatedResponse<Activity>> {
    return this.api.getPaginated<Activity>('/activities', query);
  }

  getById(id: string): Observable<Activity> {
    return this.api.get<Activity>(`/activities/${id}`);
  }

  create(activity: Partial<Activity>): Observable<Activity> {
    return this.api.post<Activity>('/activities', activity);
  }

  update(id: string, activity: Partial<Activity>): Observable<Activity> {
    return this.api.patch<Activity>(`/activities/${id}`, activity);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/activities/${id}`);
  }

  getUpcoming(days = 7): Observable<Activity[]> {
    return this.api.get<Activity[]>('/activities/upcoming', { days });
  }

  getOverdue(): Observable<Activity[]> {
    return this.api.get<Activity[]>('/activities/overdue');
  }

  complete(id: string, outcome?: string): Observable<Activity> {
    return this.api.post<Activity>(`/activities/${id}/complete`, { outcome });
  }
}
