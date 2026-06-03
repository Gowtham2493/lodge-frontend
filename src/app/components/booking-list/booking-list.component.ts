import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { NotificationService } from '../../services/notification.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0"><i class="bi bi-list-ul me-2"></i>Bookings</h4>
      <select class="form-select w-auto" [(ngModel)]="filter" (ngModelChange)="applyFilter()">
        <option value="ALL">All</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-primary">₹{{ totalAmount }}</div>
          <div class="stats-label">Total Amount</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-success">₹{{ totalPaid }}</div>
          <div class="stats-label">Total Paid</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-danger">₹{{ totalPending }}</div>
          <div class="stats-label">Total Pending</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-info">{{ filteredBookings.length }}</div>
          <div class="stats-label">Bookings</div>
        </div>
      </div>
    </div>

    <div class="table-responsive bg-white shadow-sm rounded">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (booking of filteredBookings; track booking.bookingId) {
            <tr>
              <td>{{ booking.bookingId }}</td>
              <td>
                <strong>{{ booking.customerName }}</strong><br>
                <small class="text-muted">{{ booking.customerPhone }}</small>
              </td>
              <td>{{ booking.roomNumber }}</td>
              <td>{{ booking.checkinTime | date:'short' }}</td>
              <td>{{ booking.checkoutTime ? (booking.checkoutTime | date:'short') : '-' }}</td>
              <td>
                @if (booking.amount) {
                  ₹{{ booking.amount }}<br>
                  <small class="text-muted">Paid: ₹{{ booking.amountPaid || 0 }}</small>
                } @else {
                  -
                }
              </td>
              <td>
                <span class="badge"
                  [class.bg-danger]="booking.paymentStatus === 'PENDING'"
                  [class.bg-warning]="booking.paymentStatus === 'PARTIAL'"
                  [class.bg-success]="booking.paymentStatus === 'PAID'">
                  {{ booking.paymentStatus || 'PENDING' }}
                </span>
                @if (booking.paymentMode) {
                  <br><small class="text-muted">{{ booking.paymentMode }}</small>
                }
              </td>
              <td>
                <span class="badge" [class.bg-success]="booking.status === 'ACTIVE'" [class.bg-secondary]="booking.status === 'COMPLETED'">
                  {{ booking.status }}
                </span>
              </td>
              <td>
                <small class="text-muted">{{ booking.createdBy }}</small>
                @if (booking.updatedBy && booking.updatedBy !== booking.createdBy) {
                  <br><small class="text-warning">edited: {{ booking.updatedBy }}</small>
                }
              </td>
              <td>
                @if (booking.status === 'ACTIVE') {
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editBooking(booking)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmCheckout(booking)" [disabled]="checkingOut === booking.bookingId">
                    @if (checkingOut === booking.bookingId) {
                      <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                      <i class="bi bi-box-arrow-right me-1"></i>Checkout
                    }
                  </button>
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="9" class="text-center text-muted py-4">No bookings found</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  filter = 'ALL';
  checkingOut: number | null = null;

  get totalAmount(): number {
    return this.filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  }

  get totalPaid(): number {
    return this.filteredBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  }

  get totalPending(): number {
    return this.totalAmount - this.totalPaid;
  }

  constructor(private bookingService: BookingService, private notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  applyFilter(): void {
    if (this.filter === 'ALL') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === this.filter);
    }
  }

  editBooking(booking: Booking): void {
    this.router.navigate(['/bookings', booking.bookingId, 'edit']);
  }

  confirmCheckout(booking: Booking): void {
    if (confirm(`Checkout ${booking.customerName} from Room ${booking.roomNumber}?`)) {
      this.checkingOut = booking.bookingId;
      this.bookingService.checkout(booking.bookingId).subscribe({
        next: () => {
          this.notificationService.success(`Room ${booking.roomNumber} checked out successfully`);
          this.loadBookings();
          this.checkingOut = null;
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Checkout failed');
          this.checkingOut = null;
        }
      });
    }
  }

  private loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.applyFilter();
      },
      error: () => {}
    });
  }
}
