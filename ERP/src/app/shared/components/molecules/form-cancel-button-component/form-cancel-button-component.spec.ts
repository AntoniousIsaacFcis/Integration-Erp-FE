import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCancelButtonComponent } from './form-cancel-button-component';

describe('FormCancelButtonComponent', () => {
  let component: FormCancelButtonComponent;
  let fixture: ComponentFixture<FormCancelButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCancelButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCancelButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
