import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

import { Atividade, TipoAtividade } from '../models/atividade.model';

interface NovaAtividade {
  tipo: TipoAtividade;
  descricao: string;
  entidade?: 'solicitacao' | 'usuario' | 'preferencia' | 'sistema';
  entidadeId?: string | number | null;
}

@Injectable({
  providedIn: 'root',
})
export class AtividadesService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private atividadesRef = collection(this.firestore, 'atividades');

  listarAtividades(): Observable<Atividade[]> {
    const atividadesQuery = query(this.atividadesRef, orderBy('data', 'desc'), limit(30));

    return collectionData(atividadesQuery, {
      idField: 'id',
    }) as Observable<Atividade[]>;
  }

  async registrarAtividade(atividade: NovaAtividade) {
    const usuario = this.auth.currentUser;

    if (!usuario) {
      return;
    }

    try {
      await addDoc(this.atividadesRef, {
        tipo: atividade.tipo,
        descricao: atividade.descricao,

        usuarioEmail: usuario.email ?? null,
        usuarioNome: usuario.displayName ?? 'Usuário logado',
        usuarioFoto: usuario.photoURL ?? null,

        entidade: atividade.entidade ?? 'sistema',
        entidadeId: atividade.entidadeId ?? null,

        data: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  }
}
