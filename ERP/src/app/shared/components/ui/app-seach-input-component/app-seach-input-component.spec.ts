import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSeachInputComponent } from './app-seach-input-component';

describe('AppSeachInputComponent', () => {
  let component: AppSeachInputComponent;
  let fixture: ComponentFixture<AppSeachInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSeachInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSeachInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
