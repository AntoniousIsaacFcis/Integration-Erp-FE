import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgFiltersBarComponent } from './org-filters-bar-component';

describe('OrgFiltersBarComponent', () => {
  let component: OrgFiltersBarComponent;
  let fixture: ComponentFixture<OrgFiltersBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgFiltersBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgFiltersBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
