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
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss'
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
