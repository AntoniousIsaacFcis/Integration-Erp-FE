import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDesignationsComponent } from './view-designations-component';

describe('ViewDesignationsComponent', () => {
  let component: ViewDesignationsComponent;
  let fixture: ComponentFixture<ViewDesignationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDesignationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDesignationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
