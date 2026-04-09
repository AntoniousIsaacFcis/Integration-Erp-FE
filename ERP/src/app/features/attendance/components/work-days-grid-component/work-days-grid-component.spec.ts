import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDaysGridComponent } from './work-days-grid-component';

describe('WorkDaysGridComponent', () => {
  let component: WorkDaysGridComponent;
  let fixture: ComponentFixture<WorkDaysGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkDaysGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkDaysGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
