import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeBasicInfoComponent } from './employee-basic-info-component';

describe('EmployeeBasicInfoComponent', () => {
  let component: EmployeeBasicInfoComponent;
  let fixture: ComponentFixture<EmployeeBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeBasicInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeBasicInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
