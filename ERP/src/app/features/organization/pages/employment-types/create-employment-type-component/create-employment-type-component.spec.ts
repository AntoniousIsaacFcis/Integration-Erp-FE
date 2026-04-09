import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmploymentTypeComponent } from './create-employment-type-component';

describe('CreateEmploymentTypeComponent', () => {
  let component: CreateEmploymentTypeComponent;
  let fixture: ComponentFixture<CreateEmploymentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEmploymentTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEmploymentTypeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
