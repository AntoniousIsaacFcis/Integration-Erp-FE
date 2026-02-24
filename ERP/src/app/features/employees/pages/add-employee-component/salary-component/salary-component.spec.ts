import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryComponent } from './salary-component';

describe('SalaryComponent', () => {
  let component: SalaryComponent;
  let fixture: ComponentFixture<SalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
