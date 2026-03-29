import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPromptComponent } from './auth-prompt-component';

describe('AuthPromptComponent', () => {
  let component: AuthPromptComponent;
  let fixture: ComponentFixture<AuthPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthPromptComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
