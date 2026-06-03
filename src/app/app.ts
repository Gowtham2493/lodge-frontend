import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent, NavItem, ProfileMenuItem } from './components/header/header.component';
import { SidenavComponent, SideNavItem } from './components/sidenav/sidenav.component';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidenavComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  notifications: Notification[] = [];
  navItems: NavItem[] = [];
  sidenavItems: SideNavItem[] = [];
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
      this.navItems = []; // Remove items from header

      // Add items to sidenav with icons
      this.sidenavItems = [
        { label: 'Dashboard', link: '/dashboard', icon: 'bi-speedometer2' },
        { label: 'New Booking', link: '/bookings/new', icon: 'bi-plus-circle' },
        { label: 'Bookings', link: '/bookings', icon: 'bi-calendar-check' },
        { label: 'Rooms', link: '/rooms', icon: 'bi-door-open' }
      ];

      if (this.authService.isSuperAdmin()) {
        this.sidenavItems.push({ label: 'Employees', link: '/employees', icon: 'bi-people' });
      }
    } else {
      this.navItems = [];
      this.sidenavItems = [];
    }
  }

  onNavItemClick(item: NavItem): void {
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  onSideNavItemClick(item: SideNavItem): void {
    if (item.link) {
      this.router.navigate([item.link]);
    } else if (item.action) {
      // Handle action if needed
    }
  }

  onProfileMenuItemClick(item: ProfileMenuItem): void {
    if (item.action === 'logout') {
      this.authService.logout();
    }
  }
}
