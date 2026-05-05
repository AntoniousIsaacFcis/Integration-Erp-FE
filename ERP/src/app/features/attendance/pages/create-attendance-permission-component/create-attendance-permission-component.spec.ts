import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttendancePermissionComponent } from './create-attendance-permission-component';

describe('CreateAttendancePermissionComponent', () => {
  let component: CreateAttendancePermissionComponent;
  let fixture: ComponentFixture<CreateAttendancePermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAttendancePermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAttendancePermissionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
