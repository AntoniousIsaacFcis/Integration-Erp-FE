import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPermissionComponent } from './add-permission-component';

describe('AddPermissionComponent', () => {
  let component: AddPermissionComponent;
  let fixture: ComponentFixture<AddPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPermissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPermissionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
