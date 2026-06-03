import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2"></i>Edit Booking #{{ bookingId }}</h4>

    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Loading booking...</p>
      </div>
    } @else if (booking) {
      <div class="form-section">
        <h5 class="mb-3 text-muted"><i class="bi bi-person me-2"></i>Customer: {{ booking.customerName }} ({{ booking.customerPhone }})</h5>
      </div>

      <div class="form-section">
        <h5 class="mb-3 text-primary"><i class="bi bi-calendar-check me-2"></i>Booking Details</h5>
        <div class="row g-3" [formGroup]="editForm">
          <div class="col-md-6">
            <label class="form-label">Room</label>
            <select class="form-select" formControlName="roomId">
              @for (room of availableRooms; track room.roomId) {
                <option [value]="room.roomId">Room {{ room.roomNumber }} (Capacity: {{ room.capacity }})</option>
              }
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Number of People</label>
            <input type="number" class="form-control" formControlName="noOfPeople" min="1">
          </div>
          <div class="col-md-6">
            <label class="form-label">Check-out Date & Time</label>
            <input type="datetime-local" class="form-control" formControlName="checkoutTime">
          </div>
          <div class="col-md-4">
            <label class="form-label">Total Amount (&#8377;)</label>
            <input type="number" class="form-control" formControlName="amount" min="0">
          </div>
          <div class="col-md-4">
            <label class="form-label">Amount Paid (&#8377;)</label>
            <input type="number" class="form-control" formControlName="amountPaid" min="0">
          </div>
          <div class="col-md-4">
            <label class="form-label">Payment Status</label>
            <select class="form-select" formControlName="paymentStatus">
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Payment Mode</label>
            <select class="form-select" formControlName="paymentMode">
              <option value="">Select payment mode</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger">{{ errorMessage }}</div>
      }

      <div class="d-flex gap-2">
        <button type="button" class="btn btn-primary px-4" [disabled]="submitting" (click)="onSave()">
          @if (submitting) {
            <span class="spinner-border spinner-border-sm me-1"></span>
          }
          <i class="bi bi-check-circle me-1"></i>Save Changes
        </button>
        <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    }
  `
})
export class EditBookingComponent implements OnInit {
  bookingId!: number;
  booking: Booking | null = null;
  editForm: FormGroup;
  availableRooms: Room[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';

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
