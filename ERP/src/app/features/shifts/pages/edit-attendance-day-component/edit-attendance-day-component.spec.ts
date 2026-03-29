import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAttendanceDayComponent } from './edit-attendance-day-component';

describe('EditAttendanceDayComponent', () => {
  let component: EditAttendanceDayComponent;
  let fixture: ComponentFixture<EditAttendanceDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAttendanceDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAttendanceDayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
