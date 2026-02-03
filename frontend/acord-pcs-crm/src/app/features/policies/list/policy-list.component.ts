import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PolicyService } from '../../../core/services/policy.service';
import { Policy, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, DataTableComponent],
  templateUrl: './policy-list.component.html',
  styleUrl: './policy-list.component.scss',
})
export class PolicyListComponent implements OnInit {
  private policyService = inject(PolicyService);

  policies = signal<Policy[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<string>('');
  filterLOB = signal<string>('');

  columns: TableColumn[] = [
    { key: 'policyNumber', label: 'Policy #', type: 'link', linkPrefix: '/policies' },
    { key: 'lineOfBusiness', label: 'Line of Business', type: 'badge', badgeClass: this.getLOBBadgeClass },
    { key: 'policyStatus', label: 'Status', type: 'badge', badgeClass: this.getStatusBadgeClass },
    { key: 'effectiveDate', label: 'Effective', type: 'date' },
    { key: 'expirationDate', label: 'Expiration', type: 'date' },
    { key: 'writtenPremium', label: 'Premium', type: 'currency' },
    { key: 'carrierName', label: 'Carrier' },
  ];

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.policyService.list().subscribe({
      next: (response: PaginatedResponse<Policy>) => {
        this.policies.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getLOBBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'PERSONAL_AUTO': 'bg-info',
      'COMMERCIAL_AUTO': 'bg-primary',
      'HOMEOWNERS': 'bg-success',
      'COMMERCIAL_PROPERTY': 'bg-warning text-dark',
      'GENERAL_LIABILITY': 'bg-secondary',
      'WORKERS_COMP': 'bg-dark',
      'UMBRELLA': 'bg-purple',
    };
    return classes[value] || 'bg-secondary';
  }

  getStatusBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-success',
      'PENDING': 'bg-warning text-dark',
      'EXPIRED': 'bg-danger',
      'CANCELLED': 'bg-dark',
    };
    return classes[value] || 'bg-secondary';
  }

  get filteredPolicies(): Policy[] {
    let result = this.policies();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();
    const lob = this.filterLOB();

    if (search) {
      result = result.filter((p) =>
        p.policyNumber.toLowerCase().includes(search) ||
        p.carrierName?.toLowerCase().includes(search)
      );
    }

    if (status) {
      result = result.filter((p) => p.policyStatus === status);
    }

    if (lob) {
      result = result.filter((p) => p.lineOfBusiness === lob);
    }

    return result;
  }

  get uniqueLOBs(): string[] {
    return [...new Set(this.policies().map((p) => p.lineOfBusiness))];
  }
}
