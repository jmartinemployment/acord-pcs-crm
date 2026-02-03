import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, DataTableComponent],
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.scss',
})
export class ClaimListComponent implements OnInit {
  private claimService = inject(ClaimService);

  claims = signal<Claim[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<string>('');

  columns: TableColumn[] = [
    { key: 'claimNumber', label: 'Claim #', type: 'link', linkPrefix: '/claims' },
    { key: 'policy.policyNumber', label: 'Policy #' },
    { key: 'claimStatus', label: 'Status', type: 'badge', badgeClass: this.getStatusBadgeClass },
    { key: 'lossDate', label: 'Loss Date', type: 'date' },
    { key: 'reportedDate', label: 'Reported', type: 'date' },
    { key: 'totalReserve', label: 'Reserve', type: 'currency' },
    { key: 'totalPaid', label: 'Paid', type: 'currency' },
  ];

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading.set(true);
    this.claimService.list().subscribe({
      next: (response: PaginatedResponse<Claim>) => {
        this.claims.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'bg-warning text-dark',
      'IN_PROGRESS': 'bg-info',
      'UNDER_REVIEW': 'bg-primary',
      'APPROVED': 'bg-success',
      'DENIED': 'bg-danger',
      'CLOSED': 'bg-secondary',
    };
    return classes[value] || 'bg-secondary';
  }

  get filteredClaims(): Claim[] {
    let result = this.claims();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    if (search) {
      result = result.filter((c) =>
        c.claimNumber.toLowerCase().includes(search) ||
        c.policy?.policyNumber?.toLowerCase().includes(search)
      );
    }

    if (status) {
      result = result.filter((c) => c.claimStatus === status);
    }

    return result;
  }

  get openClaimsCount(): number {
    return this.claims().filter((c) => c.claimStatus === 'OPEN' || c.claimStatus === 'IN_PROGRESS').length;
  }

  get totalReserves(): number {
    return this.claims().reduce((sum, c) => sum + (c.totalReserve || 0), 0);
  }

  get totalPaid(): number {
    return this.claims().reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  }
}
