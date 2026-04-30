import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { SolicitacaoListaComponent } from './solicitacao-lista';
import { SolicitacoesService } from '../../services/graphql.service';

registerLocaleData(localePtBr);

describe('SolicitacaoListaComponent', () => {
  let component: SolicitacaoListaComponent;
  let fixture: ComponentFixture<SolicitacaoListaComponent>;
  let mockSolicitacoesService: jasmine.SpyObj<SolicitacoesService>;

  beforeEach(async () => {
    mockSolicitacoesService = jasmine.createSpyObj(
      'SolicitacoesService',
      ['carregarSolicitacoes'],
      {
        loading: jasmine.createSpy('loading').and.returnValue(false),
        solicitacoes: jasmine.createSpy('solicitacoes').and.returnValue([]),
        error: jasmine.createSpy('error').and.returnValue(null),
      },
    );

    await TestBed.configureTestingModule({
      imports: [SolicitacaoListaComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SolicitacoesService, useValue: mockSolicitacoesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
