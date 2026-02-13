import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { LoginResponseDto, User } from '@app/data';

const TOKEN_KEY = 'task_mgmt_token';
const USER_KEY = 'task_mgmt_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<User | null>(this.getStoredUser());

  readonly isLoggedIn = computed(() => !!this.token());
  readonly currentUser = computed(() => this.user());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.token.set(res.access_token);
          this.user.set(res.user as User);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
