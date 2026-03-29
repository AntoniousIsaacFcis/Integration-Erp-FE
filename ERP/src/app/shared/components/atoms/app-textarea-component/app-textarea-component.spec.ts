import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTextareaComponent } from './app-textarea-component';

describe('AppTextareaComponent', () => {
  let component: AppTextareaComponent;
  let fixture: ComponentFixture<AppTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTextareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTextareaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
