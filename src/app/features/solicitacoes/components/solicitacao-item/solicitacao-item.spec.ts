import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';

import { SolicitacaoItemComponent } from './solicitacao-item';
import { SolicitacaoViewModel } from '../../services/graphql.service';

registerLocaleData(localePtBr);

describe('SolicitacaoItemComponent', () => {
  let component: SolicitacaoItemComponent;
  let fixture: ComponentFixture<SolicitacaoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoItemComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoItemComponent);
    component = fixture.componentInstance;

    // Fornecer um mock do solicitacao
    component.solicitacao = {
      id: 1,
      cliente: 'Teste Cliente',
      documento: '123.456.789-00',
      valor: 10000,
      status: 'pendente',
      dataSolicitacao: new Date().toISOString(),
      statusClass: 'pending',
      statusLabel: 'Pendente',
    } as SolicitacaoViewModel;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
