import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRadioComponent } from './app-radio-component';

describe('AppRadioComponent', () => {
  let component: AppRadioComponent;
  let fixture: ComponentFixture<AppRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRadioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRadioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
