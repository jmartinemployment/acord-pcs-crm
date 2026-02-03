import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { LeadService } from '../../../core/services/lead.service';
import { Lead, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, DataTableComponent],
  templateUrl: './lead-list.component.html',
  styleUrl: './lead-list.component.scss',
})
export class LeadListComponent implements OnInit {
  private leadService = inject(LeadService);

  leads = signal<Lead[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<string>('');

  columns: TableColumn[] = [
    { key: 'displayName', label: 'Name', type: 'link', linkPrefix: '/leads' },
    { key: 'leadStatus', label: 'Status', type: 'badge', badgeClass: this.getStatusBadgeClass },
    { key: 'leadSource', label: 'Source' },
    { key: 'interestedLinesDisplay', label: 'Interested In' },
    { key: 'estimatedPremium', label: 'Est. Premium', type: 'currency' },
    { key: 'leadDate', label: 'Lead Date', type: 'date' },
  ];

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading.set(true);
    this.leadService.list().subscribe({
      next: (response: PaginatedResponse<Lead>) => {
        const mapped = response.items.map((l) => ({
          ...l,
          displayName: l.companyName || `${l.firstName} ${l.lastName}`,
          interestedLinesDisplay: l.interestedLines?.join(', ') || '—',
        }));
        this.leads.set(mapped as any);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'NEW': 'bg-info',
      'CONTACTED': 'bg-primary',
      'QUALIFIED': 'bg-warning text-dark',
      'QUOTED': 'bg-purple',
      'WON': 'bg-success',
      'LOST': 'bg-danger',
    };
    return classes[value] || 'bg-secondary';
  }

  get filteredLeads(): Lead[] {
    let result = this.leads();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    if (search) {
      result = result.filter((l: any) =>
        l.displayName?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search)
      );
    }

    if (status) {
      result = result.filter((l) => l.leadStatus === status);
    }

    return result;
  }

  get pipelineStats(): { status: string; count: number; value: number }[] {
    const stats: Record<string, { count: number; value: number }> = {};
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON'];

    statuses.forEach((s) => {
      stats[s] = { count: 0, value: 0 };
    });

    this.leads().forEach((l) => {
      if (stats[l.leadStatus]) {
        stats[l.leadStatus].count++;
        stats[l.leadStatus].value += l.estimatedPremium || 0;
      }
    });

    return statuses.map((s) => ({ status: s, ...stats[s] }));
  }

  get totalPipelineValue(): number {
    return this.leads()
      .filter((l) => l.leadStatus !== 'LOST')
      .reduce((sum, l) => sum + (l.estimatedPremium || 0), 0);
  }
}
