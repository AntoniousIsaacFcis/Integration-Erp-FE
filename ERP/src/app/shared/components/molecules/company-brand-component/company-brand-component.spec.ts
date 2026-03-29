import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBrandComponent } from './company-brand-component';

describe('CompanyBrandComponent', () => {
  let component: CompanyBrandComponent;
  let fixture: ComponentFixture<CompanyBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyBrandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyBrandComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
