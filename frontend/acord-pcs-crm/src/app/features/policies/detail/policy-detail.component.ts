import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PolicyService } from '../../../core/services/policy.service';
import { Policy } from '../../../core/models';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, LoadingComponent],
  templateUrl: './policy-detail.component.html',
  styleUrl: './policy-detail.component.scss',
})
export class PolicyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private policyService = inject(PolicyService);

  policy = signal<Policy | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadPolicy(id);
    } else {
      this.loading.set(false);
    }
  }

  loadPolicy(id: string): void {
    this.policyService.getById(id).subscribe({
      next: (policy: Policy) => {
        this.policy.set(policy);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load policy');
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
    };
    return classes[status] || 'bg-secondary';
  }

  get daysUntilExpiration(): number {
    const policy = this.policy();
    if (!policy) return 0;
    const exp = new Date(policy.expirationDate);
    const now = new Date();
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
