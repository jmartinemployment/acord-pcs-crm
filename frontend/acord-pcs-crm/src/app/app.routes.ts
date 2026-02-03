import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'parties',
        loadComponent: () => import('./features/parties/list/party-list.component').then((m) => m.PartyListComponent),
      },
      {
        path: 'parties/:id',
        loadComponent: () => import('./features/parties/detail/party-detail.component').then((m) => m.PartyDetailComponent),
      },
      {
        path: 'policies',
        loadComponent: () => import('./features/policies/list/policy-list.component').then((m) => m.PolicyListComponent),
      },
      {
        path: 'policies/:id',
        loadComponent: () => import('./features/policies/detail/policy-detail.component').then((m) => m.PolicyDetailComponent),
      },
      {
        path: 'claims',
        loadComponent: () => import('./features/claims/list/claim-list.component').then((m) => m.ClaimListComponent),
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./features/claims/detail/claim-detail.component').then((m) => m.ClaimDetailComponent),
      },
      {
        path: 'bonds',
        loadComponent: () => import('./features/bonds/list/bond-list.component').then((m) => m.BondListComponent),
      },
      {
        path: 'bonds/:id',
        loadComponent: () => import('./features/bonds/detail/bond-detail.component').then((m) => m.BondDetailComponent),
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/list/lead-list.component').then((m) => m.LeadListComponent),
      },
      {
        path: 'leads/:id',
        loadComponent: () => import('./features/leads/detail/lead-detail.component').then((m) => m.LeadDetailComponent),
      },
      {
        path: 'activities',
        loadComponent: () => import('./features/activities/activity-list.component').then((m) => m.ActivityListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
