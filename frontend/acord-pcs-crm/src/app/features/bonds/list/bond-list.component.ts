import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { BondService } from '../../../core/services/bond.service';
import { SuretyBond, PaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-bond-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, DataTableComponent],
  templateUrl: './bond-list.component.html',
  styleUrl: './bond-list.component.scss',
})
export class BondListComponent implements OnInit {
  private bondService = inject(BondService);

  bonds = signal<SuretyBond[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  filterStatus = signal<string>('');
  filterType = signal<string>('');

  columns: TableColumn[] = [
    { key: 'bondNumber', label: 'Bond #', type: 'link', linkPrefix: '/bonds' },
    { key: 'bondType', label: 'Type', type: 'badge', badgeClass: this.getTypeBadgeClass },
    { key: 'bondStatus', label: 'Status', type: 'badge', badgeClass: this.getStatusBadgeClass },
    { key: 'effectiveDate', label: 'Effective', type: 'date' },
    { key: 'expirationDate', label: 'Expiration', type: 'date' },
    { key: 'penaltyAmount', label: 'Penalty', type: 'currency' },
    { key: 'suretyCarrier', label: 'Carrier' },
  ];

  ngOnInit(): void {
    this.loadBonds();
  }

  loadBonds(): void {
    this.loading.set(true);
    this.bondService.list().subscribe({
      next: (response: PaginatedResponse<SuretyBond>) => {
        this.bonds.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getTypeBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'CONTRACT': 'bg-primary',
      'COMMERCIAL': 'bg-info',
      'COURT': 'bg-secondary',
      'FIDELITY': 'bg-warning text-dark',
    };
    return classes[value] || 'bg-secondary';
  }

  getStatusBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-success',
      'PENDING': 'bg-warning text-dark',
      'EXPIRED': 'bg-danger',
      'CANCELLED': 'bg-dark',
      'RELEASED': 'bg-info',
    };
    return classes[value] || 'bg-secondary';
  }

  get filteredBonds(): SuretyBond[] {
    let result = this.bonds();
    const search = this.searchTerm().toLowerCase();
    const status = this.filterStatus();
    const type = this.filterType();

    if (search) {
      result = result.filter((b) =>
        b.bondNumber.toLowerCase().includes(search) ||
        b.projectName?.toLowerCase().includes(search)
      );
    }

    if (status) {
      result = result.filter((b) => b.bondStatus === status);
    }

    if (type) {
      result = result.filter((b) => b.bondType === type);
    }

    return result;
  }

  get totalPenalty(): number {
    return this.bonds().reduce((sum, b) => sum + (b.penaltyAmount || 0), 0);
  }

  get activeBondsCount(): number {
    return this.bonds().filter((b) => b.bondStatus === 'ACTIVE').length;
  }
}
