import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent, NavItem, ProfileMenuItem } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  notifications: Notification[] = [];
  navItems: NavItem[] = [];
  profileMenuItems: ProfileMenuItem[] = [
    { label: 'Logout', action: 'logout', icon: 'bi-box-arrow-right' }
  ];

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService,
    private router: Router
  ) {
    this.notificationService.notification$.subscribe(notification => {
      this.notifications.push(notification);
      setTimeout(() => {
        this.notifications.shift();
      }, 4000);
    });
  }

  ngOnInit(): void {
    this.updateNavItems();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavItems();
      });
  }

  updateNavItems(): void {
    if (this.authService.isLoggedIn()) {
      this.navItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'New Booking', link: '/bookings/new' },
        { label: 'Bookings', link: '/bookings' },
        { label: 'Rooms', link: '/rooms' }
      ];

      if (this.authService.isSuperAdmin()) {
        this.navItems.push({ label: 'Employees', link: '/employees' });
      }
    } else {
      this.navItems = [];
    }
  }

  onNavItemClick(item: NavItem): void {
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  onProfileMenuItemClick(item: ProfileMenuItem): void {
    if (item.action === 'logout') {
      this.authService.logout();
    }
  }
}
