import { Injectable, signal } from '@angular/core';
import { Solicitacao } from '../models/solicitacao.model';
import { HttpClient } from '@angular/common/http';

export interface SolicitacaoViewModel extends Solicitacao {
  statusClass: string;
  statusLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitacoesService {

  private API_URL = 'http://localhost:3000/solicitacoes';

  constructor(private http: HttpClient) {}

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  carregarSolicitacoes() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Solicitacao[]>(this.API_URL).subscribe({
      next: (data) => {
        const viewModel = data.map(s => this.mapToViewModel(s));
        this.solicitacoes.set(viewModel);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao buscar API');
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