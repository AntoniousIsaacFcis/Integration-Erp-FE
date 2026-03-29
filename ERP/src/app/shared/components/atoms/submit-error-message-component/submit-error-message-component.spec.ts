import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitErrorMessageComponent } from './submit-error-message-component';

describe('SubmitErrorMessageComponent', () => {
  let component: SubmitErrorMessageComponent;
  let fixture: ComponentFixture<SubmitErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitErrorMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitErrorMessageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
