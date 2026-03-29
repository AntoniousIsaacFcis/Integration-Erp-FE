import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelMappingComponent } from './level-mapping-component';

describe('LevelMappingComponent', () => {
  let component: LevelMappingComponent;
  let fixture: ComponentFixture<LevelMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelMappingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
