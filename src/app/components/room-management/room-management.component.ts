import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { NotificationService } from '../../services/notification.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-door-open me-2"></i>Room Management</h4>

    <div class="form-section">
      <h5 class="mb-3 text-primary">{{ editingRoom ? 'Edit Room' : 'Add New Room' }}</h5>
      <div class="row g-3" [formGroup]="roomForm">
        <div class="col-md-4">
          <label class="form-label">Room Number *</label>
          <input type="text" class="form-control" formControlName="roomNumber" placeholder="e.g. 201">
        </div>
        <div class="col-md-4">
          <label class="form-label">Capacity *</label>
          <input type="number" class="form-control" formControlName="capacity" min="1" placeholder="Max people">
        </div>
        <div class="col-md-3">
          <label class="form-label">Price/Night (&#8377;)</label>
          <input type="number" class="form-control" formControlName="pricePerNight" min="0" placeholder="e.g. 1500">
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button type="button" class="btn btn-primary" (click)="onSaveRoom()" [disabled]="roomForm.invalid">
            <i class="bi bi-check me-1"></i>{{ editingRoom ? 'Update' : 'Add Room' }}
          </button>
          @if (editingRoom) {
            <button type="button" class="btn btn-outline-secondary" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </div>
    </div>

    <div class="table-responsive bg-white shadow-sm rounded">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Room Number</th>
            <th>Capacity</th>
            <th>Price/Night</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (room of rooms; track room.roomId) {
            <tr>
              <td class="fw-bold">{{ room.roomNumber }}</td>
              <td>{{ room.capacity }} persons</td>
              <td>{{ room.pricePerNight ? '₹' + room.pricePerNight : '-' }}</td>
              <td>
                <span class="badge" [class.bg-success]="room.status === 'AVAILABLE'" [class.bg-danger]="room.status === 'OCCUPIED'">
                  {{ room.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="onEdit(room)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(room)" [disabled]="room.status === 'OCCUPIED'">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-center text-muted py-4">No rooms found</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class RoomManagementComponent implements OnInit {
  rooms: Room[] = [];
  roomForm: FormGroup;
  editingRoom: Room | null = null;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private notificationService: NotificationService
  ) {
    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      pricePerNight: ['']
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  onSaveRoom(): void {
    if (this.roomForm.invalid) return;

    const data = {
      roomNumber: this.roomForm.value.roomNumber,
      capacity: Number(this.roomForm.value.capacity),
      pricePerNight: this.roomForm.value.pricePerNight ? Number(this.roomForm.value.pricePerNight) : null
    };

    if (this.editingRoom) {
      this.roomService.updateRoom(this.editingRoom.roomId, data).subscribe({
        next: () => {
          this.notificationService.success('Room updated');
          this.cancelEdit();
          this.loadRooms();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to update room')
      });
    } else {
      this.roomService.createRoom(data).subscribe({
        next: () => {
          this.notificationService.success('Room added');
          this.roomForm.reset();
          this.loadRooms();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to add room')
      });
    }
  }

  onEdit(room: Room): void {
    this.editingRoom = room;
    this.roomForm.patchValue({ roomNumber: room.roomNumber, capacity: room.capacity, pricePerNight: room.pricePerNight || '' });
  }

  onDelete(room: Room): void {
    if (confirm(`Delete Room ${room.roomNumber}?`)) {
      this.roomService.deleteRoom(room.roomId).subscribe({
        next: () => {
          this.notificationService.success('Room deleted');
          this.loadRooms();
        },
        error: (err) => this.notificationService.error(err.error?.error || 'Failed to delete room')
      });
    }
  }

  cancelEdit(): void {
    this.editingRoom = null;
    this.roomForm.reset();
  }

  private loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => this.rooms = rooms
    });
  }
}
