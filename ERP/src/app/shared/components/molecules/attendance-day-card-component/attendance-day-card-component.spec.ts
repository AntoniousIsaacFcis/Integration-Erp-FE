import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceDayCardComponent } from './attendance-day-card-component';

describe('AttendanceDayCardComponent', () => {
  let component: AttendanceDayCardComponent;
  let fixture: ComponentFixture<AttendanceDayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceDayCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceDayCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
