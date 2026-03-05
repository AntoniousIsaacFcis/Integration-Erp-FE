import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInfoSidebarComponent } from './employee-info-sidebar-component';

describe('EmployeeInfoSidebarComponent', () => {
  let component: EmployeeInfoSidebarComponent;
  let fixture: ComponentFixture<EmployeeInfoSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInfoSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInfoSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
