import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SideNavItem {
  label: string;
  link?: string;
  action?: string;
  icon?: string;
  children?: SideNavItem[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  private router = inject(Router);
  currentRoute: string = '';
  /** Navigation items to display in the sidebar */
  navItems = input<SideNavItem[]>([]);

  /** Whether the sidebar is collapsed */
  isCollapsed = input<boolean>(false);

  /** Whether the mobile menu is open */
  isMobileOpen = input<boolean>(false);

  /** Emitted when a navigation item is clicked */
  navItemClicked = output<SideNavItem>();

  /** Emitted when collapse toggle is clicked */
  toggleCollapse = output<void>();

  constructor() {
    this.currentRoute = this.router.url;

    // Update current route on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  onNavClick(item: SideNavItem, event: Event) {
    event.preventDefault();
    this.navItemClicked.emit(item);
  }

  onToggleCollapse() {
    this.toggleCollapse.emit();
  }

  isActive(item: SideNavItem): boolean {
    if (!item.link) return false;
    // Exact match only - prevents parent routes from being active when on child routes
    return this.currentRoute === item.link;
  }
}
