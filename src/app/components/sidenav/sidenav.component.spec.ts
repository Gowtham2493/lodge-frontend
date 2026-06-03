import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidenavComponent, SideNavItem } from './sidenav.component';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation items', () => {
    const mockNavItems: SideNavItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'bi-speedometer2' },
      { label: 'Bookings', link: '/bookings', icon: 'bi-calendar-check' }
    ];

    fixture.componentRef.setInput('navItems', mockNavItems);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navItems = compiled.querySelectorAll('.sidenav__item');

    expect(navItems.length).toBe(2);
  });

  it('should display icon when provided', () => {
    const mockNavItems: SideNavItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'bi-speedometer2' }
    ];

    fixture.componentRef.setInput('navItems', mockNavItems);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.sidenav__icon');

    expect(icon).toBeTruthy();
    expect(icon?.classList.contains('bi-speedometer2')).toBe(true);
  });

  it('should emit navItemClicked when item is clicked', () => {
    const mockNavItems: SideNavItem[] = [
      { label: 'Dashboard', link: '/dashboard', icon: 'bi-speedometer2' }
    ];

    fixture.componentRef.setInput('navItems', mockNavItems);
    fixture.detectChanges();

    spyOn(component.navItemClicked, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const navLink = compiled.querySelector('.sidenav__link') as HTMLElement;
    navLink.click();

    expect(component.navItemClicked.emit).toHaveBeenCalledWith(mockNavItems[0]);
  });

  it('should apply collapsed class when isCollapsed is true', () => {
    fixture.componentRef.setInput('isCollapsed', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const sidenav = compiled.querySelector('.sidenav');

    expect(sidenav?.classList.contains('sidenav--collapsed')).toBe(true);
  });

  it('should not apply collapsed class when isCollapsed is false', () => {
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const sidenav = compiled.querySelector('.sidenav');

    expect(sidenav?.classList.contains('sidenav--collapsed')).toBe(false);
  });
});
