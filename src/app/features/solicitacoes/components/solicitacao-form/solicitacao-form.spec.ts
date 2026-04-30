import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoForm } from './solicitacao-form';

describe('SolicitacaoForm', () => {
  let component: SolicitacaoForm;
  let fixture: ComponentFixture<SolicitacaoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
