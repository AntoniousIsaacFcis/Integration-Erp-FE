import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceLogDetailsComponent } from './attendance-log-details-component';

describe('AttendanceLogDetailsComponent', () => {
  let component: AttendanceLogDetailsComponent;
  let fixture: ComponentFixture<AttendanceLogDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceLogDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceLogDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
