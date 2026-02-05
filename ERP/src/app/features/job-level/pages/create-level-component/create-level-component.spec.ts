import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLevelComponent } from './create-level-component';

describe('CreateLevelComponent', () => {
  let component: CreateLevelComponent;
  let fixture: ComponentFixture<CreateLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLevelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
