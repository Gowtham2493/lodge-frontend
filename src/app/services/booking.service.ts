import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { Booking } from '../models/booking.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = environment.apiUrl;
  private bookingsCache$?: Observable<Booking[]>;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 5000; // 5 seconds

  constructor(private http: HttpClient) {}

  createBooking(booking: any): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, booking).pipe(
      tap(() => this.clearCache())
    );
  }

  getAllBookings(forceRefresh: boolean = false): Observable<Booking[]> {
    const now = Date.now();

    if (!forceRefresh && this.bookingsCache$ && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.bookingsCache$;
    }

    this.cacheTimestamp = now;
    this.bookingsCache$ = this.http.get<Booking[]>(`${this.apiUrl}/bookings`).pipe(
      tap(data => console.log('Bookings fetched from API:', data)),
      shareReplay(1)
    );

    return this.bookingsCache$;
  }

  private clearCache(): void {
    this.bookingsCache$ = undefined;
    this.cacheTimestamp = 0;
  }

  getBooking(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  updateBooking(bookingId: number, data: any): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${bookingId}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  checkout(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${bookingId}/checkout`, {}).pipe(
      tap(() => this.clearCache())
    );
  }
}
