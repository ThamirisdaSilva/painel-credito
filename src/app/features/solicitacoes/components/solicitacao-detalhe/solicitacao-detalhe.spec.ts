import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoDetalheComponent } from './solicitacao-detalhe';

describe('SolicitacaoDetalhe', () => {
  let component: SolicitacaoDetalheComponent;
  let fixture: ComponentFixture<SolicitacaoDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoDetalheComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
