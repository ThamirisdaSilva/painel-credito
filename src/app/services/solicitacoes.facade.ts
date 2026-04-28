import { Injectable, signal, computed, effect } from '@angular/core';

import { SolicitacoesService, SolicitacaoViewModel } from './graphql.service';
import { StatusSolicitacao } from '../models/solicitacao.model';
import { AtividadesService } from './atividades.service';

@Injectable({ providedIn: 'root' })
export class SolicitacoesFacade {
  private filtroSelecionado = signal<string>('');
  private termoBusca = signal<string>('');
  private _solicitacoes = signal<SolicitacaoViewModel[]>([]);

  constructor(
    private service: SolicitacoesService,
    private atividadesService: AtividadesService,
  ) {
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

  private atualizarLista(lista: SolicitacaoViewModel[]) {
    this._solicitacoes.set(lista);
    this.service.salvar(lista);
  }

  private aplicarStatusVisual(item: SolicitacaoViewModel): SolicitacaoViewModel {
    const status = item.status?.toLowerCase() ?? '';

    const classMap: Record<string, string> = {
      pendente: 'card__status--pendente',
      em_analise: 'card__status--analise',
      aprovado: 'card__status--aprovado',
      recusado: 'card__status--recusado',
    };

    const labelMap: Record<string, string> = {
      pendente: 'Pendente',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      recusado: 'Recusado',
    };

    return {
      ...item,
      status: status as StatusSolicitacao,
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? item.statusLabel,
    };
  }

  atualizarStatus(id: number | string, status: StatusSolicitacao) {
    const solicitacaoAntesDaAtualizacao = this._solicitacoes().find(
      (item) => String(item.id) === String(id),
    );

    const lista = this._solicitacoes().map((item) => {
      if (String(item.id) !== String(id)) {
        return item;
      }

      return this.aplicarStatusVisual({
        ...item,
        status,
      });
    });

    this.atualizarLista(lista);

    if (!solicitacaoAntesDaAtualizacao) {
      return;
    }

    const tipo = status === 'aprovado' ? 'aprovacao' : 'recusa';

    const descricao =
      status === 'aprovado'
        ? `Solicitação de ${solicitacaoAntesDaAtualizacao.cliente} foi aprovada`
        : `Solicitação de ${solicitacaoAntesDaAtualizacao.cliente} foi recusada`;

    void this.atividadesService.registrarAtividade({
      tipo,
      descricao,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  criar(novo: SolicitacaoViewModel) {
    const novaSolicitacao = this.aplicarStatusVisual(novo);

    const atual = this.service.getDadosPersistidos();
    const lista = [...atual, novaSolicitacao];

    this.atualizarLista(lista);

    void this.atividadesService.registrarAtividade({
      tipo: 'criacao',
      descricao: `Nova solicitação criada para ${novaSolicitacao.cliente}`,
      entidade: 'solicitacao',
      entidadeId: novaSolicitacao.id,
    });
  }

  editar(id: number | string, atualizado: SolicitacaoViewModel) {
    const solicitacaoAtualizada = this.aplicarStatusVisual(atualizado);

    const atual = this.service.getDadosPersistidos();

    const lista = atual.map((item) =>
      String(item.id) === String(id) ? solicitacaoAtualizada : item,
    );

    this.atualizarLista(lista);

    void this.atividadesService.registrarAtividade({
      tipo: 'edicao',
      descricao: `Solicitação de ${solicitacaoAtualizada.cliente} foi editada`,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  deletar(id: number | string) {
    const atual = this.service.getDadosPersistidos();

    const solicitacao = atual.find((item) => String(item.id) === String(id));

    const lista = atual.filter((item) => String(item.id) !== String(id));

    this.atualizarLista(lista);

    if (!solicitacao) {
      return;
    }

    void this.atividadesService.registrarAtividade({
      tipo: 'exclusao',
      descricao: `Solicitação de ${solicitacao.cliente} foi excluída`,
      entidade: 'solicitacao',
      entidadeId: solicitacao.id,
    });
  }

  getById(id: number | string) {
    return this._solicitacoes().find((item) => String(item.id) === String(id));
  }

  lista() {
    return this._solicitacoes();
  }
}
