import { Injectable, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';

import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';
import { AtividadesService } from './atividades.service';
import { AuthService } from './auth.service';

export interface SolicitacaoViewModel extends Solicitacao {
  statusClass: string;
  statusLabel: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacoesService {
  private collectionName = 'solicitacoes';

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  feedback = signal<string | null>(null);

  constructor(
    private firestore: Firestore,
    private atividadesService: AtividadesService,
    private authService: AuthService,
  ) {}

  carregarSolicitacoes() {
    this.loading.set(true);
    this.error.set(null);

    const solicitacoesRef = collection(this.firestore, this.collectionName);

    collectionData(solicitacoesRef, {
      idField: 'id',
    }).subscribe({
      next: (data) => {
        const lista = data as Solicitacao[];

        const viewModel = lista.map((item) => this.mapToViewModel(item));

        this.solicitacoes.set(viewModel);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar solicitações:', error);

        this.error.set('Erro ao carregar solicitações do Firebase.');
        this.loading.set(false);
      },
    });
  }

  async criarSolicitacao(dados: { cliente: string; documento: string; valor: number }) {
    const usuario = this.authService.usuario();

    const novaSolicitacao: Omit<Solicitacao, 'id'> = {
      cliente: dados.cliente,
      documento: dados.documento,
      valor: dados.valor,
      status: 'pendente',
      dataSolicitacao: new Date().toISOString(),
      criadoPor: usuario?.email ?? null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const solicitacoesRef = collection(this.firestore, this.collectionName);

    const documentoCriado = await addDoc(solicitacoesRef, novaSolicitacao);

    this.exibirFeedback('Solicitação criada com sucesso.');

    await this.atividadesService.registrarAtividade({
      tipo: 'solicitacao_criada',
      descricao: `Solicitação criada para ${dados.cliente}`,
      entidade: 'solicitacao',
      entidadeId: documentoCriado.id,
    });
  }

  async editarSolicitacao(
    id: string,
    dados: {
      cliente: string;
      documento: string;
      valor: number;
    },
  ) {
    const solicitacaoRef = doc(this.firestore, `${this.collectionName}/${id}`);

    await updateDoc(solicitacaoRef, {
      cliente: dados.cliente,
      documento: dados.documento,
      valor: dados.valor,
      atualizadoEm: new Date().toISOString(),
    });

    this.exibirFeedback('Solicitação atualizada com sucesso.');

    await this.atividadesService.registrarAtividade({
      tipo: 'solicitacao_editada',
      descricao: `Solicitação editada para ${dados.cliente}`,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  async atualizarStatus(id: string, novoStatus: StatusSolicitacao) {
    const solicitacao = this.solicitacoes().find((item) => item.id === id);

    const solicitacaoRef = doc(this.firestore, `${this.collectionName}/${id}`);

    await updateDoc(solicitacaoRef, {
      status: novoStatus,
      atualizadoEm: new Date().toISOString(),
    });

    this.exibirFeedback('Status atualizado com sucesso.');

    await this.atividadesService.registrarAtividade({
      tipo: 'status_atualizado',
      descricao: `Status da solicitação de ${
        solicitacao?.cliente ?? 'cliente'
      } alterado para ${novoStatus}`,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  async excluirSolicitacao(id: string) {
    const solicitacao = this.solicitacoes().find((item) => item.id === id);

    const solicitacaoRef = doc(this.firestore, `${this.collectionName}/${id}`);

    await deleteDoc(solicitacaoRef);

    this.exibirFeedback('Solicitação excluída com sucesso.');

    await this.atividadesService.registrarAtividade({
      tipo: 'solicitacao_excluida',
      descricao: `Solicitação de ${solicitacao?.cliente ?? 'cliente'} excluída`,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  limparFeedback() {
    this.feedback.set(null);
  }

  private exibirFeedback(mensagem: string) {
    this.feedback.set(mensagem);

    setTimeout(() => {
      this.feedback.set(null);
    }, 4000);
  }

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
}
