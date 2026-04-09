import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPermissionsComponent } from './view-permissions-component';

describe('ViewPermissionsComponent', () => {
  let component: ViewPermissionsComponent;
  let fixture: ComponentFixture<ViewPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPermissionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
