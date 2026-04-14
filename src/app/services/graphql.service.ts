import { Injectable, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Solicitacao } from '../models/solicitacao.model';

export interface SolicitacaoViewModel extends Solicitacao {
  statusClass: string;
  statusLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitacoesService {

  constructor(private apollo: Apollo) {}

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  carregarSolicitacoes() {
    this.loading.set(true);
    this.error.set(null);

    this.apollo.query<{ solicitacoes: Solicitacao[] }>({
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
      fetchPolicy: 'no-cache'
    }).subscribe({
      next: (result) => {
        const data = result.data?.solicitacoes || [];
        const viewModel = data.map(s => this.mapToViewModel(s));
        this.solicitacoes.set([...viewModel]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao buscar API GraphQL');
        this.loading.set(false);
      }
    });
  }

  private mapToViewModel(s: Solicitacao): SolicitacaoViewModel {
    const status = s.status?.toLowerCase() ?? '';

    const classMap: Record<string, string> = {
      pendente: 'card__status--pendente',
      em_analise: 'card__status--analise',
      aprovado: 'card__status--aprovado',
      recusado: 'card__status--recusado'
    };

    const labelMap: Record<string, string> = {
      pendente: 'Pendente',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      recusado: 'Recusado'
    };

    return {
      ...s,
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? s.status
    };
  }
}