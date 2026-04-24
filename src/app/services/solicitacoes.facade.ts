import { Injectable, signal, computed, effect } from '@angular/core';
import { SolicitacoesService, SolicitacaoViewModel } from './graphql.service';
import { StatusSolicitacao } from '../models/solicitacao.model';

@Injectable({ providedIn: 'root' })
export class SolicitacoesFacade {
  private filtroSelecionado = signal<string>('');
  private termoBusca = signal<string>('');
  private _solicitacoes = signal<SolicitacaoViewModel[]>([]);

  constructor(private service: SolicitacoesService) {
    effect(() => {
      const lista = this.service.solicitacoes();
      if (lista.length > 0) {
        this._solicitacoes.set(lista);
      } else {
        this.carregar();
      }
    });
  }

  carregar() {
    const local = this.service.getDadosPersistidos();

    if (local.length > 0) {
      this._solicitacoes.set(local);
    } else {
      this.service.carregarSolicitacoes();
      const dados = this.service.solicitacoes();
      this._solicitacoes.set(dados);
    }
  }

  listaFiltrada = computed(() => {
    let lista = this._solicitacoes();
    const filtro = this.filtroSelecionado();
    const busca = this.termoBusca();

    if (filtro) {
      lista = lista.filter((i) => i.status === filtro);
    }

    if (busca) {
      lista = lista.filter((i) => i.cliente.toLowerCase().includes(busca));
    }

    return lista;
  });

  aplicarFiltro(status: string) {
    this.filtroSelecionado.set(status);
  }

  aplicarBusca(termo: string) {
    this.termoBusca.set(termo.toLowerCase());
  }

  private atualizarLista(lista: SolicitacaoViewModel[]) {
    this._solicitacoes.set(lista);
    this.service.salvar(lista);
  }

  atualizarStatus(id: number | string, status: StatusSolicitacao) {
    const lista = this._solicitacoes().map((item) =>
      String(item.id) === String(id) ? { ...item, status } : item,
    );

    this.atualizarLista(lista);
  }

  criar(novo: SolicitacaoViewModel) {
    const atual = this.service.getDadosPersistidos();
    const lista = [...atual, novo];
    this.atualizarLista(lista);
  }

  editar(id: number | string, atualizado: SolicitacaoViewModel) {
    const atual = this.service.getDadosPersistidos();
    const lista = atual.map((item) => (String(item.id) === String(id) ? atualizado : item));
    this.atualizarLista(lista);
  }

  deletar(id: number | string) {
    const atual = this.service.getDadosPersistidos();
    const lista = atual.filter((item) => String(item.id) !== String(id));
    this.atualizarLista(lista);
  }

  getById(id: number | string) {
    return this._solicitacoes().find((item) => String(item.id) === String(id));
  }

  lista() {
    return this._solicitacoes();
  }
}
