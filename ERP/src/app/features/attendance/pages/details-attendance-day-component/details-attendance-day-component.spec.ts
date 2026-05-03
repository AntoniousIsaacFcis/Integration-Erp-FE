import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAttendanceDayComponent } from './details-attendance-day-component';

describe('DetailsAttendanceDayComponent', () => {
  let component: DetailsAttendanceDayComponent;
  let fixture: ComponentFixture<DetailsAttendanceDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsAttendanceDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsAttendanceDayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
