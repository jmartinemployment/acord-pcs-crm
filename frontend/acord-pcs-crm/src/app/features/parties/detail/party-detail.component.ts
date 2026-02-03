import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PartyService } from '../../../core/services/party.service';
import { Party } from '../../../core/models';

@Component({
  selector: 'app-party-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, LoadingComponent],
  templateUrl: './party-detail.component.html',
  styleUrl: './party-detail.component.scss',
})
export class PartyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private partyService = inject(PartyService);

  party = signal<Party | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadParty(id);
    } else {
      this.loading.set(false);
    }
  }

  loadParty(id: string): void {
    this.partyService.getById(id).subscribe({
      next: (party: Party) => {
        this.party.set(party);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load party');
        this.loading.set(false);
      },
    });
  }

  get displayName(): string {
    const p = this.party();
    if (!p) return '';
    return p.partyType === 'PERSON'
      ? `${p.firstName} ${p.lastName}`
      : p.commercialName || p.dba || 'Unknown';
  }

  get primaryAddress(): string {
    const addr = this.party()?.addresses?.find((a) => a.isPrimary) || this.party()?.addresses?.[0];
    if (!addr) return '—';
    return [addr.line1, addr.city, addr.stateProvince, addr.postalCode].filter(Boolean).join(', ');
  }

  get primaryPhone(): string {
    const phone = this.party()?.phones?.find((p) => p.isPrimary) || this.party()?.phones?.[0];
    return phone?.phoneNumber || '—';
  }

  get primaryEmail(): string {
    const email = this.party()?.emails?.find((e) => e.isPrimary) || this.party()?.emails?.[0];
    return email?.emailAddress || '—';
  }
}
