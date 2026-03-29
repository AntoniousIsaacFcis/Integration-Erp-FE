import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableStatusBadgeComponent } from './table-status-badge-component';

describe('TableStatusBadgeComponent', () => {
  let component: TableStatusBadgeComponent;
  let fixture: ComponentFixture<TableStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableStatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableStatusBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
