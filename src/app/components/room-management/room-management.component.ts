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
  templateUrl: './room-management.component.html',
  styleUrl: './room-management.component.scss'
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
