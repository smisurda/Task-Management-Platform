import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-md p-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">Task Management</h1>
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="space-y-4"
          >
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-500 text-sm mt-1">Valid email required</p>
              }
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-500 text-sm mt-1">Password required</p>
              }
            </div>
            @if (errorMessage) {
              <p class="text-red-500 text-sm">{{ errorMessage }}</p>
            }
            <button
              type="submit"
              [disabled]="form.invalid || loading"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
          <p class="text-gray-500 text-sm mt-4">
            Demo: owner@example.com / admin123
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Login failed';
        },
        complete: () => (this.loading = false),
      });
  }
}
