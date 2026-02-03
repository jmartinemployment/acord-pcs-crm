import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse, ApiResponse } from '../models';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.apiUrl;

  private isBrowser = isPlatformBrowser(this.platformId);
  private currentUserSignal = signal<User | null>(this.loadUser());

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  isReadonly = computed(() => this.currentUserSignal()?.role === 'READONLY');

  private loadUser(): User | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      map((response: ApiResponse<LoginResponse>) => {
        if (response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Login failed');
      }),
      catchError((error) => {
        throw error.error?.error?.message || error.message || 'Login failed';
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: LoginResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, authResult.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, authResult.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authResult.user));
    }
    this.currentUserSignal.set(authResult.user);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  refreshToken(): Observable<LoginResponse | null> {
    if (!this.isBrowser) return of(null);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    ) as Observable<LoginResponse | null>;
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/me`).pipe(
      tap((response) => {
        if (response.success && response.data) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          this.currentUserSignal.set(response.data);
        }
      })
    ) as unknown as Observable<User>;
  }
}
