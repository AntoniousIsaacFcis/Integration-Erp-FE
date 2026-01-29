import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginagtionComponent } from './paginagtion-component';

describe('PaginagtionComponent', () => {
  let component: PaginagtionComponent;
  let fixture: ComponentFixture<PaginagtionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginagtionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginagtionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
