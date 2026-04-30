import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuladorCredito } from './simulador-credito';

describe('SimuladorCredito', () => {
  let component: SimuladorCredito;
  let fixture: ComponentFixture<SimuladorCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladorCredito],
    }).compileComponents();

    fixture = TestBed.createComponent(SimuladorCredito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
