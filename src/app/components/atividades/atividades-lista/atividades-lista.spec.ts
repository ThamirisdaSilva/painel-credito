import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtividadesLista } from './atividades-lista';

describe('AtividadesLista', () => {
  let component: AtividadesLista;
  let fixture: ComponentFixture<AtividadesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtividadesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(AtividadesLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
