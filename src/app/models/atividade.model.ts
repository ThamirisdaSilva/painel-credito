export type TipoAtividade =
  | 'login'
  | 'logout'
  | 'criacao'
  | 'edicao'
  | 'aprovacao'
  | 'recusa'
  | 'exclusao'
  | 'tema'
  | 'idioma'
  | 'erro'
  | 'solicitacao_criada'
  | 'solicitacao_editada'
  | 'solicitacao_excluida'
  | 'status_atualizado';

export interface Atividade {
  id?: string;

  tipo: TipoAtividade;
  descricao: string;

  usuarioEmail: string | null;
  usuarioNome: string | null;
  usuarioFoto: string | null;

  entidade?: 'solicitacao' | 'usuario' | 'preferencia' | 'sistema';
  entidadeId?: string | number | null;

  data?: any;
}
