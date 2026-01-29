import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLogoComponent } from './project-logo-component';

describe('ProjectLogoComponent', () => {
  let component: ProjectLogoComponent;
  let fixture: ComponentFixture<ProjectLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLogoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
