import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { Room } from '../models/room.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = environment.apiUrl;
  private roomsCache$?: Observable<Room[]>;
  private availableRoomsCache$?: Observable<Room[]>;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 3000; // 3 seconds

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    const now = Date.now();

    if (this.roomsCache$ && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.roomsCache$;
    }

    this.cacheTimestamp = now;
    this.roomsCache$ = this.http.get<Room[]>(`${this.apiUrl}/rooms`).pipe(
      shareReplay(1)
    );

    return this.roomsCache$;
  }

  getAvailableRooms(): Observable<Room[]> {
    const now = Date.now();

    if (this.availableRoomsCache$ && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.availableRoomsCache$;
    }

    this.cacheTimestamp = now;
    this.availableRoomsCache$ = this.http.get<Room[]>(`${this.apiUrl}/rooms/available`).pipe(
      shareReplay(1)
    );

    return this.availableRoomsCache$;
  }

  createRoom(data: any): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  updateRoom(id: number, data: any): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/rooms/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rooms/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.roomsCache$ = undefined;
    this.availableRoomsCache$ = undefined;
    this.cacheTimestamp = 0;
  }
}
