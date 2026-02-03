import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../core/models';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, LoadingComponent],
  templateUrl: './claim-detail.component.html',
  styleUrl: './claim-detail.component.scss',
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private claimService = inject(ClaimService);

  claim = signal<Claim | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadClaim(id);
    } else {
      this.loading.set(false);
    }
  }

  loadClaim(id: string): void {
    this.claimService.getById(id).subscribe({
      next: (claim: Claim) => {
        this.claim.set(claim);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load claim');
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'bg-warning text-dark',
      'IN_PROGRESS': 'bg-info',
      'UNDER_REVIEW': 'bg-primary',
      'APPROVED': 'bg-success',
      'DENIED': 'bg-danger',
      'CLOSED': 'bg-secondary',
    };
    return classes[status] || 'bg-secondary';
  }

  get daysSinceLoss(): number {
    const claim = this.claim();
    if (!claim) return 0;
    const loss = new Date(claim.lossDate);
    const now = new Date();
    return Math.ceil((now.getTime() - loss.getTime()) / (1000 * 60 * 60 * 24));
  }

  get lossLocation(): string {
    const c = this.claim();
    if (!c) return '—';
    const parts = [c.lossAddress, c.lossCity, c.lossState].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  }

  get paidPercentage(): number {
    const c = this.claim();
    if (!c || !c.totalReserve || c.totalReserve === 0) return 0;
    return ((c.totalPaid || 0) / c.totalReserve) * 100;
  }
}
