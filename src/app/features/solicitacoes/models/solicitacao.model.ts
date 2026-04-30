export type StatusSolicitacao = 'pendente' | 'em_analise' | 'aprovado' | 'recusado';

export interface Solicitacao {
  id?: string;
  cliente: string;
  documento: string;
  valor: number;
  status: StatusSolicitacao;
  dataSolicitacao: string;
  criadoPor?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface SolicitacaoViewModel extends Solicitacao {
  statusLabel: string;
  statusClass: string;
}
