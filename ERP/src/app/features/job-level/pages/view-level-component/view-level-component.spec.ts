import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLevelComponent } from './view-level-component';

describe('ViewLevelComponent', () => {
  let component: ViewLevelComponent;
  let fixture: ComponentFixture<ViewLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLevelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
