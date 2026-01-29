import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBaseTableComponent } from './app-base-table-component';

describe('AppBaseTableComponent', () => {
  let component: AppBaseTableComponent;
  let fixture: ComponentFixture<AppBaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBaseTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBaseTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
