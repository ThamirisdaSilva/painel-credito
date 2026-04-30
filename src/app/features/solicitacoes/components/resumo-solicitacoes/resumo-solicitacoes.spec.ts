import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoSolicitacoes } from './resumo-solicitacoes';

describe('ResumoSolicitacoes', () => {
  let component: ResumoSolicitacoes;
  let fixture: ComponentFixture<ResumoSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoSolicitacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
