import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { NotificationService } from '../../services/notification.service';
import { Booking } from '../../models/booking.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss'
})
export class BookingListComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  filter = 'ALL';
  checkingOut: number | null = null;
  loading: boolean = false;
  private routerSubscription?: Subscription;

  get totalAmount(): number {
    return this.filteredBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  }

  get totalPaid(): number {
    return this.filteredBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  }

  get totalPending(): number {
    return this.totalAmount - this.totalPaid;
  }

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookings(true);

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/bookings' || event.urlAfterRedirects === '/bookings') {
          this.loadBookings(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  applyFilter(): void {
    if (this.filter === 'ALL') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === this.filter);
    }
    this.cdr.detectChanges();
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
          this.loadBookings(true);
          this.checkingOut = null;
        },
        error: (err) => {
          this.notificationService.error(err.error?.error || 'Checkout failed');
          this.checkingOut = null;
        }
      });
    }
  }

  private loadBookings(forceRefresh: boolean = false): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.bookingService.getAllBookings(forceRefresh).subscribe({
      next: (bookings) => {
        console.log('Bookings received in component:', bookings);
        this.bookings = Array.isArray(bookings) ? bookings : [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loading = false;
        this.bookings = [];
        this.filteredBookings = [];
        this.cdr.detectChanges();
      }
    });
  }
}
