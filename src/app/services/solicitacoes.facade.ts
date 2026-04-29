import { Injectable, Signal, computed, effect, signal } from '@angular/core';

import { SolicitacoesService, SolicitacaoViewModel } from './graphql.service';
import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitacoesFacade {
  private filtroSelecionado = signal<string>('');
  private termoBusca = signal<string>('');
  private _solicitacoes = signal<SolicitacaoViewModel[]>([]);

  feedback!: Signal<string | null>;

  constructor(private service: SolicitacoesService) {
    this.feedback = this.service.feedback;

    effect(() => {
      this._solicitacoes.set(this.service.solicitacoes());
    });
  }

  carregar() {
    this.service.carregarSolicitacoes();
  }

  listaFiltrada = computed(() => {
    let lista = this._solicitacoes();

    const filtro = this.filtroSelecionado();
    const busca = this.termoBusca();

    if (filtro) {
      lista = lista.filter((item) => item.status === filtro);
    }

    if (busca) {
      lista = lista.filter((item) => item.cliente.toLowerCase().includes(busca));
    }

    return lista;
  });

  aplicarFiltro(status: string) {
    this.filtroSelecionado.set(status);
  }

  aplicarBusca(termo: string) {
    this.termoBusca.set(termo.toLowerCase());
  }

  async atualizarStatus(id: number | string, status: StatusSolicitacao) {
    await this.service.atualizarStatus(String(id), status);
  }

  async criar(novo: Solicitacao) {
    await this.service.criarSolicitacao({
      cliente: novo.cliente,
      documento: novo.documento,
      valor: novo.valor,
    });
  }

  async editar(id: number | string, atualizado: Solicitacao) {
    await this.service.editarSolicitacao(String(id), {
      cliente: atualizado.cliente,
      documento: atualizado.documento,
      valor: atualizado.valor,
    });
  }

  async deletar(id: number | string) {
    await this.service.excluirSolicitacao(String(id));
  }

  getById(id: number | string) {
    return this._solicitacoes().find((item) => String(item.id) === String(id));
  }

  lista() {
    return this._solicitacoes();
  }
}
