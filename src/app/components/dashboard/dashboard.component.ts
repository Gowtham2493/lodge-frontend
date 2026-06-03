import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  private routerSubscription?: Subscription;

  // Stats
  totalRooms: number = 0;
  availableRooms: number = 0;
  occupiedRooms: number = 0;
  repeatGuests: number = 0;

  // Trends (you can calculate these based on historical data)
  totalRoomsTrend: number = 30;
  availableRoomsTrend: number = 62;
  occupiedRoomsTrend: number = 24;

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.refreshInterval = setInterval(() => this.loadRooms(), 30000);

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/dashboard' || event.urlAfterRedirects === '/dashboard') {
          this.loadRooms();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.routerSubscription?.unsubscribe();
  }

  private loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = this.addMockBookings(rooms);
        this.calculateStats();
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
      }
    });
  }

  private addMockBookings(rooms: Room[]): Room[] {
    // Add booking info only for OCCUPIED rooms
    const roomsWithBookings = rooms.map(room => {
      if (room.status === 'OCCUPIED') {
        return {
          ...room,
          booking: {
            guestName: 'John Doe',
            checkInDate: '2026-06-01',
            checkOutDate: '2026-06-07'
          }
        };
      }
      return room;
    });

    // Sort by roomId
    return roomsWithBookings.sort((a, b) => a.roomId - b.roomId);
  }

  private calculateStats(): void {
    this.totalRooms = this.rooms.length;
    this.availableRooms = this.rooms.filter(r => r.status === 'AVAILABLE').length;
    this.occupiedRooms = this.rooms.filter(r => r.status === 'OCCUPIED').length;
    this.repeatGuests = 0; // Set to 0 as requested
  }

  getRoomCardClass(room: Room): string {
    const classes: string[] = [];

    switch (room.status) {
      case 'AVAILABLE':
        classes.push('available');
        break;
      case 'OCCUPIED':
        classes.push('occupied');
        break;
      case 'CLEANING':
        classes.push('cleaning');
        break;
      case 'MAINTENANCE':
        classes.push('maintenance');
        break;
      case 'OUT_OF_ORDER':
        classes.push('out-of-order');
        break;
    }

    return classes.join(' ');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  navigateToNewBooking(): void {
    this.router.navigate(['/bookings/new']);
  }
}
