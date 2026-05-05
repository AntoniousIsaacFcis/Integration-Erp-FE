import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLeaveApplicationComponent } from './create-leave-application-component';

describe('CreateLeaveApplicationComponent', () => {
  let component: CreateLeaveApplicationComponent;
  let fixture: ComponentFixture<CreateLeaveApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLeaveApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLeaveApplicationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
