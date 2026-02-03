import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Claim, PaginatedResponse } from '../models';

export interface ClaimQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  claimStatus?: string;
  policyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClaimPayment {
  id: string;
  claimId: string;
  paymentDate: string;
  paymentAmount: number;
  paymentType?: string;
  payeeName?: string;
  checkNumber?: string;
  memo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  private api = inject(ApiService);

  list(query?: ClaimQuery): Observable<PaginatedResponse<Claim>> {
    return this.api.getPaginated<Claim>('/claims', query);
  }

  getById(id: string): Observable<Claim> {
    return this.api.get<Claim>(`/claims/${id}`);
  }

  create(claim: Partial<Claim>): Observable<Claim> {
    return this.api.post<Claim>('/claims', claim);
  }

  update(id: string, claim: Partial<Claim>): Observable<Claim> {
    return this.api.patch<Claim>(`/claims/${id}`, claim);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/claims/${id}`);
  }

  getOpenClaims(): Observable<Claim[]> {
    return this.api.get<Claim[]>('/claims/open');
  }

  getStats(): Observable<{ openClaims: number; totalReserves: number; totalPaid: number; byStatus: any[] }> {
    return this.api.get('/claims/stats');
  }

  addPayment(claimId: string, payment: Partial<ClaimPayment>): Observable<ClaimPayment> {
    return this.api.post<ClaimPayment>(`/claims/${claimId}/payments`, payment);
  }
}
