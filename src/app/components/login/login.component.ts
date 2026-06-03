import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="row justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="col-11 col-sm-8 col-md-5 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <i class="bi bi-building text-primary" style="font-size: 3rem;"></i>
              <h3 class="mt-2 fw-bold">Lodge Manager</h3>
              <p class="text-muted">Sign in to continue</p>
            </div>

            @if (errorMessage) {
              <div class="alert alert-danger py-2">{{ errorMessage }}</div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" formControlName="username" placeholder="Enter username">
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" formControlName="password" placeholder="Enter password">
              </div>
              <button type="submit" class="btn btn-primary w-100" [disabled]="loading || loginForm.invalid">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
