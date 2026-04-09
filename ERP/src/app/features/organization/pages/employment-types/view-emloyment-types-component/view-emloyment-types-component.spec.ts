import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmloymentTypesComponent } from './view-emloyment-types-component';

describe('ViewEmloymentTypesComponent', () => {
  let component: ViewEmloymentTypesComponent;
  let fixture: ComponentFixture<ViewEmloymentTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEmloymentTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEmloymentTypesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
