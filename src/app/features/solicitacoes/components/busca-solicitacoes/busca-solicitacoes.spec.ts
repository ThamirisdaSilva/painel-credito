import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaSolicitacoes } from './busca-solicitacoes';

describe('BuscaSolicitacoes', () => {
  let component: BuscaSolicitacoes;
  let fixture: ComponentFixture<BuscaSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscaSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscaSolicitacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
