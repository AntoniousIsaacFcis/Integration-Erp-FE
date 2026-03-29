import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSpecialShiftComponent } from './create-special-shift-component';

describe('CreateSpecialShiftComponent', () => {
  let component: CreateSpecialShiftComponent;
  let fixture: ComponentFixture<CreateSpecialShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSpecialShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSpecialShiftComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
