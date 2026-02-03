import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { BondService } from '../../../core/services/bond.service';
import { SuretyBond } from '../../../core/models';

@Component({
  selector: 'app-bond-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, LoadingComponent],
  templateUrl: './bond-detail.component.html',
  styleUrl: './bond-detail.component.scss',
})
export class BondDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bondService = inject(BondService);

  bond = signal<SuretyBond | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadBond(id);
    } else {
      this.loading.set(false);
    }
  }

  loadBond(id: string): void {
    this.bondService.getById(id).subscribe({
      next: (bond: SuretyBond) => {
        this.bond.set(bond);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load bond');
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-success',
      'PENDING': 'bg-warning text-dark',
      'EXPIRED': 'bg-danger',
      'CANCELLED': 'bg-dark',
      'RELEASED': 'bg-info',
    };
    return classes[status] || 'bg-secondary';
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'CONTRACT': 'bg-primary',
      'COMMERCIAL': 'bg-info',
      'COURT': 'bg-secondary',
      'FIDELITY': 'bg-warning text-dark',
    };
    return classes[type] || 'bg-secondary';
  }

  get projectLocation(): string {
    const b = this.bond();
    if (!b) return '—';
    const parts = [b.projectCity, b.projectState].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  }

  get daysUntilExpiration(): number | null {
    const b = this.bond();
    if (!b || !b.expirationDate) return null;
    const exp = new Date(b.expirationDate);
    const now = new Date();
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
