import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDateInputComponent } from './app-date-input-component';

describe('AppDateInputComponent', () => {
  let component: AppDateInputComponent;
  let fixture: ComponentFixture<AppDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDateInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDateInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
