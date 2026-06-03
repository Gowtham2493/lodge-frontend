import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = environment.apiUrl;
  private employeesCache$?: Observable<any[]>;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 5000; // 5 seconds

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<any[]> {
    const now = Date.now();

    if (this.employeesCache$ && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.employeesCache$;
    }

    this.cacheTimestamp = now;
    this.employeesCache$ = this.http.get<any[]>(`${this.apiUrl}/employees`).pipe(
      shareReplay(1)
    );

    return this.employeesCache$;
  }

  createEmployee(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  updateEmployee(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache(): void {
    this.employeesCache$ = undefined;
    this.cacheTimestamp = 0;
  }
}
