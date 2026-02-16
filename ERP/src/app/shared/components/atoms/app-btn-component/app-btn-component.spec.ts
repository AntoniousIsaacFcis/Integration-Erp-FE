import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBtnComponent } from './app-btn-component';

describe('AppBtnComponent', () => {
  let component: AppBtnComponent;
  let fixture: ComponentFixture<AppBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBtnComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
