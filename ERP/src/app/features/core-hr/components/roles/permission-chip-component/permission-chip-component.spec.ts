import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionChipComponent } from './permission-chip-component';

describe('PermissionChipComponent', () => {
  let component: PermissionChipComponent;
  let fixture: ComponentFixture<PermissionChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionChipComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
