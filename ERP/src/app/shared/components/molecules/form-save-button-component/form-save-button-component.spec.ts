import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSaveButtonComponent } from './form-save-button-component';

describe('FormSaveButtonComponent', () => {
  let component: FormSaveButtonComponent;
  let fixture: ComponentFixture<FormSaveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSaveButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSaveButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
