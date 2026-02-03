import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Policy, PaginatedResponse, Coverage } from '../models';

export interface PolicyQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  lineOfBusiness?: string;
  policyStatus?: string;
  partyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  private api = inject(ApiService);

  list(query?: PolicyQuery): Observable<PaginatedResponse<Policy>> {
    return this.api.getPaginated<Policy>('/policies', query);
  }

  getById(id: string): Observable<Policy> {
    return this.api.get<Policy>(`/policies/${id}`);
  }

  create(policy: Partial<Policy>): Observable<Policy> {
    return this.api.post<Policy>('/policies', policy);
  }

  update(id: string, policy: Partial<Policy>): Observable<Policy> {
    return this.api.patch<Policy>(`/policies/${id}`, policy);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/policies/${id}`);
  }

  getExpiring(days = 30): Observable<Policy[]> {
    return this.api.get<Policy[]>('/policies/expiring', { days });
  }

  getStats(): Observable<{ totalPolicies: number; activePolicies: number; totalPremium: number; byLOB: any[] }> {
    return this.api.get('/policies/stats');
  }

  addCoverage(policyId: string, coverage: Partial<Coverage>): Observable<Coverage> {
    return this.api.post<Coverage>(`/policies/${policyId}/coverages`, coverage);
  }
}
