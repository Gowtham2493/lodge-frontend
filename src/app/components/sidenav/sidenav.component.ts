import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  /** Navigation items to display in the sidebar */
  navItems = input<SideNavItem[]>([]);

  /** Whether the sidebar is collapsed */
  isCollapsed = input<boolean>(false);

  /** Whether the mobile menu is open */
  isMobileOpen = input<boolean>(false);

  /** Emitted when a navigation item is clicked */
  navItemClicked = output<SideNavItem>();

  onNavClick(item: SideNavItem, event: Event) {
    event.preventDefault();
    this.navItemClicked.emit(item);
  }
}
