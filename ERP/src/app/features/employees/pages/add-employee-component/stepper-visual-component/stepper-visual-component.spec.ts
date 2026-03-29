import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperVisualComponent } from './stepper-visual-component';

describe('StepperVisualComponent', () => {
  let component: StepperVisualComponent;
  let fixture: ComponentFixture<StepperVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperVisualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperVisualComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
