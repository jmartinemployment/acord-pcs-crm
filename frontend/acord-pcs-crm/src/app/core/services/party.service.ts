import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Party, PaginatedResponse } from '../models';

export interface PartyQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  partyType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class PartyService {
  private api = inject(ApiService);

  list(query?: PartyQuery): Observable<PaginatedResponse<Party>> {
    return this.api.getPaginated<Party>('/parties', query);
  }

  getById(id: string): Observable<Party> {
    return this.api.get<Party>(`/parties/${id}`);
  }

  create(party: Partial<Party>): Observable<Party> {
    return this.api.post<Party>('/parties', party);
  }

  update(id: string, party: Partial<Party>): Observable<Party> {
    return this.api.patch<Party>(`/parties/${id}`, party);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/parties/${id}`);
  }

  search(query: string): Observable<Party[]> {
    return this.api.get<Party[]>('/parties/search', { q: query });
  }
}
