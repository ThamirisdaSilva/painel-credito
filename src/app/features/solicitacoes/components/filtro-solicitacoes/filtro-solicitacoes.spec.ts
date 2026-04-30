import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroSolicitacoes } from './filtro-solicitacoes';

describe('FiltroSolicitacoes', () => {
  let component: FiltroSolicitacoes;
  let fixture: ComponentFixture<FiltroSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroSolicitacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
