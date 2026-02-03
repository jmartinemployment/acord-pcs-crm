import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lead, PaginatedResponse, LeadPipeline } from '../models';

export interface LeadQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  leadStatus?: string;
  leadSource?: string;
  assignedTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private api = inject(ApiService);

  list(query?: LeadQuery): Observable<PaginatedResponse<Lead>> {
    return this.api.getPaginated<Lead>('/leads', query);
  }

  getById(id: string): Observable<Lead> {
    return this.api.get<Lead>(`/leads/${id}`);
  }

  create(lead: Partial<Lead>): Observable<Lead> {
    return this.api.post<Lead>('/leads', lead);
  }

  update(id: string, lead: Partial<Lead>): Observable<Lead> {
    return this.api.patch<Lead>(`/leads/${id}`, lead);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/leads/${id}`);
  }

  getPipeline(): Observable<LeadPipeline> {
    return this.api.get<LeadPipeline>('/leads/pipeline');
  }

  convert(id: string, data: { createParty?: boolean; interestedLines?: string[] }): Observable<{ lead: Lead; party?: any }> {
    return this.api.post(`/leads/${id}/convert`, data);
  }
}
