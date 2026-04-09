import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSpecificShiftComponent } from './view-specific-shift-component';

describe('ViewSpecificShiftComponent', () => {
  let component: ViewSpecificShiftComponent;
  let fixture: ComponentFixture<ViewSpecificShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSpecificShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSpecificShiftComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
