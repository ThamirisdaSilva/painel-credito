import { Injectable, signal, Inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, shareReplay } from 'rxjs/operators';

import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';
import { STORAGE_KEY } from './storage.token';

export interface SolicitacaoViewModel extends Solicitacao {
  statusClass: string;
  statusLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacoesService {
  constructor(
    private apollo: Apollo,
    @Inject(STORAGE_KEY) private storageKey: string,
  ) {}

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // MÉTODO COM CACHE (shareReplay)
  getSolicitacoes$() {
    return this.apollo
      .query<{ solicitacoes: Solicitacao[] }>({
        query: gql`
          query {
            solicitacoes {
              id
              cliente
              documento
              valor
              status
              dataSolicitacao
            }
          }
        `,
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => result.data?.solicitacoes || []),
        shareReplay(1),
      );
  }

  // LOCAL STORAGE
  getDadosPersistidos(): SolicitacaoViewModel[] {
    const dados = localStorage.getItem(this.storageKey);

    if (dados) {
      const lista = JSON.parse(dados);

      return lista.map((item: any) =>
        this.mapToViewModel({
          ...item,
          status: item.status as StatusSolicitacao,
        }),
      );
    }

    return [];
  }

  salvar(lista: SolicitacaoViewModel[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(lista));
  }

  // CARREGAMENTO DE DADOS
  carregarSolicitacoes() {
    this.loading.set(true);
    this.error.set(null);

    const local = this.getDadosPersistidos();

    if (local.length > 0) {
      this.solicitacoes.set(local);
      this.loading.set(false);
      return;
    }

    this.getSolicitacoes$().subscribe({
      next: (data) => {
        const viewModel = data.map((s) => this.mapToViewModel(s));

        this.solicitacoes.set(viewModel);
        this.salvar(viewModel);

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao buscar API GraphQL');
        this.loading.set(false);
      },
    });
  }

  // VIEW MODEL
  private mapToViewModel(s: Solicitacao): SolicitacaoViewModel {
    const status = s.status?.toLowerCase() ?? '';

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
      ...s,
      status: status as StatusSolicitacao,
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? s.status,
    };
  }

  // ATUALIZAÇÃO DE STATUS
  atualizarStatus(id: number | string, novoStatus: StatusSolicitacao) {
    this.solicitacoes.update((lista) => {
      const novaLista = lista.map((item) =>
        String(item.id) === String(id)
          ? this.mapToViewModel({ ...item, status: novoStatus })
          : item,
      );

      this.salvar(novaLista);
      return novaLista;
    });
  }
}
