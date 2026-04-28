import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { HeaderComponent } from '../../shared/header/header';
import { FiltroSolicitacoesComponent } from '../filtro-solicitacoes/filtro-solicitacoes';
import { ResumoSolicitacoesComponent } from '../resumo-solicitacoes/resumo-solicitacoes';
import { BuscaSolicitacoesComponent } from '../busca-solicitacoes/busca-solicitacoes';
import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    SolicitacaoItemComponent,
    HeaderComponent,
    FiltroSolicitacoesComponent,
    ResumoSolicitacoesComponent,
    BuscaSolicitacoesComponent,
    TranslatePipe,
  ],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss'],
})
export class SolicitacaoListaComponent implements OnInit {
  constructor(
    public facade: SolicitacoesFacade,
    private router: Router,
  ) {}

  ngOnInit() {
    this.facade.carregar();
  }

  irParaNova() {
    this.router.navigate(['/solicitacoes/nova']);
  }

  trackById(index: number, item: SolicitacaoViewModel) {
    return item.id;
  }
}
