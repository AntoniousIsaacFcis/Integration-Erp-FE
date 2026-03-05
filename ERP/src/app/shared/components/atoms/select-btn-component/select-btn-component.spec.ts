import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBtnComponent } from './select-btn-component';

describe('SelectBtnComponent', () => {
  let component: SelectBtnComponent;
  let fixture: ComponentFixture<SelectBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectBtnComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
