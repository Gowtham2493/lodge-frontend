import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';
import { Customer } from '../../models/customer.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-booking.component.html',
  styleUrl: './new-booking.component.scss'
})
export class NewBookingComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  bookingForm: FormGroup;
  availableRooms: Room[] = [];
  selectedFile: File | null = null;
  submitting = false;
  errorMessage = '';
  existingCustomer: Customer | null = null;
  private routerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private bookingService: BookingService,
    private roomService: RoomService,
    private notificationService: NotificationService,
    private router: Router
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

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/bookings/new' || event.urlAfterRedirects === '/bookings/new') {
          this.loadAvailableRooms();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
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
