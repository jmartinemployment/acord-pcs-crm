import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, LoadingComponent],
  templateUrl: './lead-detail.component.html',
  styleUrl: './lead-detail.component.scss',
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leadService = inject(LeadService);

  lead = signal<Lead | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadLead(id);
    } else {
      this.loading.set(false);
    }
  }

  loadLead(id: string): void {
    this.leadService.getById(id).subscribe({
      next: (lead: Lead) => {
        this.lead.set(lead);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load lead');
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'NEW': 'bg-info',
      'CONTACTED': 'bg-primary',
      'QUALIFIED': 'bg-warning text-dark',
      'QUOTED': 'bg-purple',
      'WON': 'bg-success',
      'LOST': 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
  }

  get displayName(): string {
    const l = this.lead();
    if (!l) return '';
    return l.companyName || `${l.firstName} ${l.lastName}`;
  }

  get daysSinceCreated(): number {
    const l = this.lead();
    if (!l) return 0;
    const created = new Date(l.leadDate);
    const now = new Date();
    return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }
}
