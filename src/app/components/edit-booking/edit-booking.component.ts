import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';
import { Booking } from '../../models/booking.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-booking.component.html',
  styleUrl: './edit-booking.component.scss'
})
export class EditBookingComponent implements OnInit, OnDestroy {
  bookingId!: number;
  booking: Booking | null = null;
  editForm: FormGroup;
  availableRooms: Room[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';
  private routerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private roomService: RoomService,
    private notificationService: NotificationService
  ) {
    this.editForm = this.fb.group({
      roomId: [''],
      noOfPeople: ['', [Validators.required, Validators.min(1)]],
      checkoutTime: [''],
      paymentMode: [''],
      amount: [''],
      amountPaid: [''],
      paymentStatus: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBooking();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const newId = Number(this.route.snapshot.paramMap.get('id'));
        if (newId && newId !== this.bookingId) {
          this.bookingId = newId;
          this.loadBooking();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  onSave(): void {
    this.errorMessage = '';
    this.submitting = true;

    const val = this.editForm.value;
    const updateData: any = {};

    if (val.roomId && Number(val.roomId) !== this.booking!.roomId) {
      updateData.roomId = Number(val.roomId);
    }
    if (val.noOfPeople) {
      updateData.noOfPeople = Number(val.noOfPeople);
    }
    if (val.checkoutTime) {
      updateData.checkoutTime = val.checkoutTime;
    }
    if (val.paymentMode) {
      updateData.paymentMode = val.paymentMode;
    }
    if (val.amount !== null && val.amount !== '') {
      updateData.amount = Number(val.amount);
    }
    if (val.amountPaid !== null && val.amountPaid !== '') {
      updateData.amountPaid = Number(val.amountPaid);
    }
    if (val.paymentStatus) {
      updateData.paymentStatus = val.paymentStatus;
    }

    this.bookingService.updateBooking(this.bookingId, updateData).subscribe({
      next: () => {
        this.notificationService.success('Booking updated successfully!');
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to update booking';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  private loadBooking(): void {
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.editForm.patchValue({
          roomId: booking.roomId,
          noOfPeople: booking.noOfPeople,
          checkoutTime: booking.checkoutTime ? booking.checkoutTime.slice(0, 16) : '',
          paymentMode: booking.paymentMode || '',
          amount: booking.amount || '',
          amountPaid: booking.amountPaid || 0,
          paymentStatus: booking.paymentStatus || 'PENDING'
        });
        this.loading = false;
        this.loadRooms();
      },
      error: () => {
        this.notificationService.error('Failed to load booking');
        this.router.navigate(['/bookings']);
      }
    });
  }

  private loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.availableRooms = rooms.filter(r => r.status === 'AVAILABLE' || r.roomId === this.booking?.roomId);
      }
    });
  }
}
