import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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
