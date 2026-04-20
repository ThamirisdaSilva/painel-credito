import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SolicitacoesService, SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { HeaderComponent } from '../../shared/header/header';
import { FiltroSolicitacoesComponent } from '../filtro-solicitacoes/filtro-solicitacoes';
import { ResumoSolicitacoesComponent } from '../resumo-solicitacoes/resumo-solicitacoes';
import { BuscaSolicitacoesComponent } from '../busca-solicitacoes/busca-solicitacoes';

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
    BuscaSolicitacoesComponent
  ],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  filtroSelecionado = signal<string>('');
  termoBusca = signal<string>('');

  ngOnInit() {
    if (this.service.solicitacoes().length === 0) {
      this.service.carregarSolicitacoes();
    }
  }

  aplicarFiltro(status: string) {
    this.filtroSelecionado.set(status);
  }

  aplicarBusca(termo: string) {
    this.termoBusca.set(termo.toLowerCase());
  }

  listaFiltrada = computed(() => {
    let lista = this.service.solicitacoes();

    const filtro = this.filtroSelecionado();
    const busca = this.termoBusca();

    if (filtro) {
      lista = lista.filter(item => item.status === filtro);
    }

    if (busca) {
      lista = lista.filter(item =>
        item.cliente.toLowerCase().includes(busca)
      );
    }

    return lista;
  });

  trackById(index: number, item: SolicitacaoViewModel) {
    return item.id;
  }
}