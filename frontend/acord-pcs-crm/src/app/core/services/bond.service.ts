import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SuretyBond, PaginatedResponse, BondParty } from '../models';

export interface BondQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  bondType?: string;
  bondStatus?: string;
  partyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class BondService {
  private api = inject(ApiService);

  list(query?: BondQuery): Observable<PaginatedResponse<SuretyBond>> {
    return this.api.getPaginated<SuretyBond>('/bonds', query);
  }

  getById(id: string): Observable<SuretyBond> {
    return this.api.get<SuretyBond>(`/bonds/${id}`);
  }

  create(bond: Partial<SuretyBond>): Observable<SuretyBond> {
    return this.api.post<SuretyBond>('/bonds', bond);
  }

  update(id: string, bond: Partial<SuretyBond>): Observable<SuretyBond> {
    return this.api.patch<SuretyBond>(`/bonds/${id}`, bond);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/bonds/${id}`);
  }

  getExpiring(days = 30): Observable<SuretyBond[]> {
    return this.api.get<SuretyBond[]>('/bonds/expiring', { days });
  }

  addParty(bondId: string, party: Partial<BondParty>): Observable<BondParty> {
    return this.api.post<BondParty>(`/bonds/${bondId}/parties`, party);
  }
}
