import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'bookings/new', loadComponent: () => import('./components/new-booking/new-booking.component').then(m => m.NewBookingComponent), canActivate: [authGuard] },
  { path: 'bookings/:id/edit', loadComponent: () => import('./components/edit-booking/edit-booking.component').then(m => m.EditBookingComponent), canActivate: [authGuard] },
  { path: 'bookings', loadComponent: () => import('./components/booking-list/booking-list.component').then(m => m.BookingListComponent), canActivate: [authGuard] },
  { path: 'rooms', loadComponent: () => import('./components/room-management/room-management.component').then(m => m.RoomManagementComponent), canActivate: [authGuard] },
  { path: 'employees', loadComponent: () => import('./components/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
