import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttendanceDaysComponent } from './view-attendance-days-component';

describe('ViewAttendanceDaysComponent', () => {
  let component: ViewAttendanceDaysComponent;
  let fixture: ComponentFixture<ViewAttendanceDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAttendanceDaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAttendanceDaysComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
