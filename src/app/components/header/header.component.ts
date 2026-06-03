import { Component, input, output, signal, HostListener, inject, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavItem {
  label: string;
  link?: string;
  action?: string;
}

export interface ProfileMenuItem {
  label: string;
  action: string;
  icon?: string;
}

export type HeaderVariant = 'light' | 'dark' | 'transparent' | 'primary';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  // Brand Options
  /** URL for the logo image */
  logoSrc = input<string>();
  
  /** Text title for the brand */
  title = input<string>('My App');

  // Navigation Options
  /** Array of navigation items to display in the center */
  navItems = input<NavItem[]>([]);

  // Features
  /** Whether to show a search input field */
  showSearch = input<boolean>(false);
  
  /** Whether to show the user profile section */
  showProfile = input<boolean>(false);

  // Profile Data
  /** URL for the profile avatar image */
  profileImageUrl = input<string>();
  
  profileName = input<string>();

  /** Menu items to show in the dropdown when profile is clicked */
  profileMenuItems = input<ProfileMenuItem[]>([]);

  isProfileMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  private elementRef = inject(ElementRef);

  // Styling & Behavior
  /** Visual variant of the header */
  variant = input<HeaderVariant>('light');
  
  /** Whether the header sticks to the top during scroll */
  isSticky = input<boolean>(true);

  // Events
  /** Emitted when a navigation item is clicked */
  navItemClicked = output<NavItem>();
  
  /** Emitted when the search is submitted */
  searchSubmitted = output<string>();
  
  profileClicked = output<void>();

  /** Emitted when a dropdown menu item is clicked from profile */
  profileMenuItemClicked = output<ProfileMenuItem>();

  // Internal Logic
  onNavClick(item: NavItem, event: Event) {
    event.preventDefault();
    this.navItemClicked.emit(item);
  }

  onSearch(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const input = target.querySelector('input') as HTMLInputElement;
    if (input) {
      this.searchSubmitted.emit(input.value);
    }
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen.set(false);
    }
  }

  onProfileMenuItemClick(item: ProfileMenuItem, event: Event) {
    event.preventDefault();
    this.isProfileMenuOpen.set(false);
    this.profileMenuItemClicked.emit(item);
  }
}
