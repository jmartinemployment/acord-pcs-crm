import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PartyService } from '../../../core/services/party.service';
import { Party, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-party-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, DataTableComponent],
  templateUrl: './party-list.component.html',
  styleUrl: './party-list.component.scss',
})
export class PartyListComponent implements OnInit {
  private partyService = inject(PartyService);

  parties = signal<Party[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  filterType = signal<string>('');

  columns: TableColumn[] = [
    { key: 'displayName', label: 'Name', type: 'link', linkPrefix: '/parties' },
    { key: 'partyType', label: 'Type', type: 'badge', badgeClass: this.getTypeBadgeClass },
    { key: 'primaryEmail', label: 'Email' },
    { key: 'primaryPhone', label: 'Phone' },
    { key: 'primaryCity', label: 'City' },
    { key: 'createdAt', label: 'Created', type: 'date' },
  ];

  ngOnInit(): void {
    this.loadParties();
  }

  loadParties(): void {
    this.loading.set(true);
    this.partyService.list().subscribe({
      next: (response: PaginatedResponse<Party>) => {
        const mapped = response.items.map((p) => ({
          ...p,
          displayName: p.partyType === 'PERSON'
            ? `${p.firstName} ${p.lastName}`
            : p.commercialName || p.dba || 'Unknown',
          primaryEmail: p.emails?.find((e) => e.isPrimary)?.emailAddress || p.emails?.[0]?.emailAddress || '',
          primaryPhone: p.phones?.find((ph) => ph.isPrimary)?.phoneNumber || p.phones?.[0]?.phoneNumber || '',
          primaryCity: p.addresses?.find((a) => a.isPrimary)?.city || p.addresses?.[0]?.city || '',
        }));
        this.parties.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTypeBadgeClass(value: string): string {
    return value === 'PERSON' ? 'bg-info' : 'bg-primary';
  }

  get filteredParties(): Party[] {
    let result = this.parties();
    const search = this.searchTerm().toLowerCase();
    const type = this.filterType();

    if (search) {
      result = result.filter((p: any) =>
        p.displayName?.toLowerCase().includes(search) ||
        p.primaryEmail?.toLowerCase().includes(search)
      );
    }

    if (type) {
      result = result.filter((p) => p.partyType === type);
    }

    return result;
  }
}
