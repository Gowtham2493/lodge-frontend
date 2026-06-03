import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-plus-circle me-2"></i>New Booking</h4>

    <div>
      <div class="form-section">
        <h5 class="mb-3 text-primary"><i class="bi bi-person me-2"></i>Customer Details</h5>

        @if (existingCustomer) {
          <div class="alert alert-info py-2">
            <i class="bi bi-info-circle me-1"></i>Existing customer found: <strong>{{ existingCustomer.name }}</strong> — details auto-filled.
          </div>
        }

        <div class="row g-3" [formGroup]="customerForm">
          <div class="col-md-6">
            <label class="form-label">Phone Number *</label>
            <div class="input-group">
              <input type="tel" class="form-control" formControlName="phone" placeholder="Enter phone number" (blur)="onPhoneLookup()">
              <button class="btn btn-outline-secondary" type="button" (click)="onPhoneLookup()">
                <i class="bi bi-search"></i>
              </button>
            </div>
            @if (customerForm.get('phone')?.touched && customerForm.get('phone')?.invalid) {
              <small class="text-danger">Phone (min 10 digits) is required</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Full Name *</label>
            <input type="text" class="form-control" formControlName="name" placeholder="Enter full name">
            @if (customerForm.get('name')?.touched && customerForm.get('name')?.invalid) {
              <small class="text-danger">Name is required</small>
            }
          </div>
          <div class="col-12">
            <label class="form-label">Address *</label>
            <textarea class="form-control" formControlName="address" rows="2" placeholder="Enter address"></textarea>
            @if (customerForm.get('address')?.touched && customerForm.get('address')?.invalid) {
              <small class="text-danger">Address is required</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">ID Proof Type</label>
            <select class="form-select" formControlName="idProofType">
              <option value="">Select ID type</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="Driving License">Driving License</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="PAN Card">PAN Card</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Upload ID Proof (Image only: JPG/PNG)</label>
            <input type="file" class="form-control" accept="image/jpeg,image/png" (change)="onFileSelected($event)">
          </div>
        </div>
      </div>

      <div class="form-section">
        <h5 class="mb-3 text-primary"><i class="bi bi-calendar-check me-2"></i>Booking Details</h5>
        <div class="row g-3" [formGroup]="bookingForm">
          <div class="col-md-6">
            <label class="form-label">Room *</label>
            <select class="form-select" formControlName="roomId" (change)="onRoomSelected()">
              <option value="">Select a room</option>
              @for (room of availableRooms; track room.roomId) {
                <option [value]="room.roomId">Room {{ room.roomNumber }} (Cap: {{ room.capacity }}, ₹{{ room.pricePerNight || 0 }}/night)</option>
              }
            </select>
            @if (bookingForm.get('roomId')?.touched && bookingForm.get('roomId')?.invalid) {
              <small class="text-danger">Room selection is required</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Number of People *</label>
            <input type="number" class="form-control" formControlName="noOfPeople" min="1" placeholder="Enter count">
            @if (bookingForm.get('noOfPeople')?.touched && bookingForm.get('noOfPeople')?.invalid) {
              <small class="text-danger">Required (min 1)</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Check-in Date & Time *</label>
            <input type="datetime-local" class="form-control" formControlName="checkinTime">
          </div>
          <div class="col-md-6">
            <label class="form-label">Check-out Date</label>
            <input type="datetime-local" class="form-control" formControlName="checkoutTime">
          </div>
          <div class="col-md-4">
            <label class="form-label">Total Amount (&#8377;)</label>
            <input type="number" class="form-control" formControlName="amount" min="0" placeholder="Total">
          </div>
          <div class="col-md-4">
            <label class="form-label">Amount Paid (&#8377;)</label>
            <input type="number" class="form-control" formControlName="amountPaid" min="0" placeholder="Paid now">
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
        <button type="button" class="btn btn-primary px-4" [disabled]="submitting" (click)="onSubmit()">
          @if (submitting) {
            <span class="spinner-border spinner-border-sm me-1"></span>
          }
          <i class="bi bi-check-circle me-1"></i>Create Booking
        </button>
        <button type="button" class="btn btn-outline-secondary" (click)="resetForms()">
          <i class="bi bi-x-circle me-1"></i>Reset
        </button>
      </div>
    </div>
  `
})
export class NewBookingComponent implements OnInit {
  customerForm: FormGroup;
  bookingForm: FormGroup;
  availableRooms: Room[] = [];
  selectedFile: File | null = null;
  submitting = false;
  errorMessage = '';
  existingCustomer: Customer | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private bookingService: BookingService,
    private roomService: RoomService,
    private notificationService: NotificationService
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', Validators.required],
      idProofType: ['']
    });

    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);

    this.bookingForm = this.fb.group({
      roomId: ['', Validators.required],
      noOfPeople: ['', [Validators.required, Validators.min(1)]],
      checkinTime: [localDateTime, Validators.required],
      checkoutTime: [''],
      paymentMode: [''],
      amount: [''],
      amountPaid: [0],
      paymentStatus: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.loadAvailableRooms();
  }

  onPhoneLookup(): void {
    const phone = this.customerForm.value.phone;
    if (!phone || phone.length < 10) return;

    this.customerService.lookupByPhone(phone).subscribe({
      next: (customer) => {
        if (customer) {
          this.existingCustomer = customer;
          this.customerForm.patchValue({
            name: customer.name,
            address: customer.address,
            idProofType: customer.idProofType || ''
          });
        } else {
          this.existingCustomer = null;
        }
      },
      error: () => {
        this.existingCustomer = null;
      }
    });
  }

  onRoomSelected(): void {
    const roomId = Number(this.bookingForm.value.roomId);
    const room = this.availableRooms.find(r => r.roomId === roomId);
    if (room && room.pricePerNight) {
      this.bookingForm.patchValue({ amount: room.pricePerNight });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.notificationService.error('Only image files (JPG/PNG) are allowed');
        input.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.customerForm.markAllAsTouched();
    this.bookingForm.markAllAsTouched();

    if (this.customerForm.invalid || this.bookingForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    formData.append('name', this.customerForm.value.name);
    formData.append('phone', this.customerForm.value.phone);
    formData.append('address', this.customerForm.value.address);
    if (this.customerForm.value.idProofType) {
      formData.append('idProofType', this.customerForm.value.idProofType);
    }
    if (this.selectedFile) {
      formData.append('idProofFile', this.selectedFile);
    }

    this.customerService.createCustomer(formData).subscribe({
      next: (customer) => {
        const bv = this.bookingForm.value;
        const bookingData = {
          customerId: customer.id,
          roomId: Number(bv.roomId),
          noOfPeople: Number(bv.noOfPeople),
          checkinTime: bv.checkinTime || null,
          checkoutTime: bv.checkoutTime || null,
          paymentMode: bv.paymentMode || null,
          amount: bv.amount ? Number(bv.amount) : null,
          amountPaid: bv.amountPaid ? Number(bv.amountPaid) : 0,
          paymentStatus: bv.paymentStatus || 'PENDING'
        };

        this.bookingService.createBooking(bookingData).subscribe({
          next: () => {
            this.notificationService.success('Booking created successfully!');
            this.resetForms();
            this.loadAvailableRooms();
          },
          error: (err) => {
            this.errorMessage = err.error?.error || 'Failed to create booking';
            this.submitting = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to create customer';
        this.submitting = false;
      }
    });
  }

  resetForms(): void {
    this.customerForm.reset();
    this.bookingForm.reset();
    const now = new Date();
    this.bookingForm.patchValue({ checkinTime: now.toISOString().slice(0, 16), paymentStatus: 'PENDING', amountPaid: 0 });
    this.selectedFile = null;
    this.submitting = false;
    this.existingCustomer = null;
  }

  private loadAvailableRooms(): void {
    this.roomService.getAvailableRooms().subscribe({
      next: (rooms) => this.availableRooms = rooms,
      error: () => {}
    });
  }
}
