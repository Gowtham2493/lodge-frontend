import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h4 class="fw-bold mb-3"><i class="bi bi-grid me-2"></i>Room Dashboard</h4>

    <div class="row g-3 mb-4">
      <div class="col-4">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-primary">{{ rooms.length }}</div>
          <div class="stats-label">Total Rooms</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-success">{{ availableCount }}</div>
          <div class="stats-label">Available</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stats-card bg-white text-center">
          <div class="stats-number text-danger">{{ occupiedCount }}</div>
          <div class="stats-label">Occupied</div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      @for (room of rooms; track room.roomId) {
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card room-card" [class.available]="room.status === 'AVAILABLE'" [class.occupied]="room.status === 'OCCUPIED'">
            <div class="card-body text-center py-3">
              <h5 class="card-title mb-1 fw-bold">{{ room.roomNumber }}</h5>
              <p class="card-text mb-1">
                <i class="bi bi-people me-1"></i>Capacity: {{ room.capacity }}
              </p>
              <span class="badge" [class.bg-success]="room.status === 'AVAILABLE'" [class.bg-danger]="room.status === 'OCCUPIED'">
                {{ room.status }}
              </span>
            </div>
          </div>
        </div>
      }
    </div>

    @if (rooms.length === 0) {
      <div class="text-center text-muted py-5">
        <i class="bi bi-hourglass-split" style="font-size: 2rem;"></i>
        <p class="mt-2">Loading rooms...</p>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  private refreshInterval: any;

  get availableCount(): number {
    return this.rooms.filter(r => r.status === 'AVAILABLE').length;
  }

  get occupiedCount(): number {
    return this.rooms.filter(r => r.status === 'OCCUPIED').length;
  }

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.refreshInterval = setInterval(() => this.loadRooms(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => this.rooms = rooms,
      error: () => {}
    });
  }
}
