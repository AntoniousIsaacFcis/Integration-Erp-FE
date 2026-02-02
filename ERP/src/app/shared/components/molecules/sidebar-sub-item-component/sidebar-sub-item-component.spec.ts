import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSubItemComponent } from './sidebar-sub-item-component';

describe('SidebarSubItemComponent', () => {
  let component: SidebarSubItemComponent;
  let fixture: ComponentFixture<SidebarSubItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSubItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSubItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
