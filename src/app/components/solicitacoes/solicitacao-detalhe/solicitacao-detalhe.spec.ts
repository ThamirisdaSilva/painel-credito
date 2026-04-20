import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoDetalhe } from './solicitacao-detalhe';

describe('SolicitacaoDetalhe', () => {
  let component: SolicitacaoDetalhe;
  let fixture: ComponentFixture<SolicitacaoDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoDetalhe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitacaoDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
