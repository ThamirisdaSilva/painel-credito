# AULA 12 — Backend com Firebase e Acessibilidade Aplicada

---

# PARTE 1 — PREPARAR O FIRESTORE

## 1.1 — Acessar o Firebase Console

Acessar:

```txt
https://console.firebase.google.com
```

Entrar no projeto:

```txt
painel-credito
```

Acessar:

```txt
Build
Firestore Database
```

---

## 1.2 — Criar a coleção de solicitações

Na tela do Firestore, clicar em:

```txt
Iniciar coleção
```

No campo:

```txt
Código da coleção
```

digitar:

```txt
solicitacoes
```

Clicar em:

```txt
Avançar
```

---

## 1.3 — Criar o primeiro documento

Na etapa de adicionar o primeiro documento, clicar em:

```txt
Código automático
```

Adicionar os campos:

```txt
Campo: cliente
Tipo: string
Valor: Ana Souza
```

```txt
Campo: documento
Tipo: string
Valor: 12345678901
```

```txt
Campo: valor
Tipo: number / int64
Valor: 5000
```

```txt
Campo: status
Tipo: string
Valor: pendente
```

```txt
Campo: dataSolicitacao
Tipo: string
Valor: 2026-04-29T10:00:00.000Z
```

```txt
Campo: criadoPor
Tipo: string
Valor: teste@teste.com
```

```txt
Campo: criadoEm
Tipo: string
Valor: 2026-04-29T10:00:00.000Z
```

```txt
Campo: atualizadoEm
Tipo: string
Valor: 2026-04-29T10:00:00.000Z
```

Clicar em:

```txt
Salvar
```

---

# PARTE 2 — AJUSTAR REGRAS DO FIRESTORE

## 2.1 — Acessar regras

No Firebase Console, acessar:

```txt
Firestore Database
Regras
```

Substituir o conteúdo por:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Clicar em:

```txt
Publicar
```

---

# PARTE 3 — AJUSTAR MODEL DE SOLICITAÇÃO

## Arquivo

```txt
src/app/models/solicitacao.model.ts
```

## Conteúdo completo

```ts
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
```

---

# PARTE 4 — AJUSTAR MODEL DE ATIVIDADES

## Arquivo

```txt
src/app/models/atividade.model.ts
```

## Conteúdo completo

```ts
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
```

---

# PARTE 5 — AJUSTAR SERVICE DE SOLICITAÇÕES

## Arquivo

```txt
src/app/services/graphql.service.ts
```

## Conteúdo completo

```ts
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

  async criarSolicitacao(dados: {
    cliente: string;
    documento: string;
    valor: number;
  }) {
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
```

---

# PARTE 6 — AJUSTAR FACADE DE SOLICITAÇÕES

## Arquivo

```txt
src/app/services/solicitacoes.facade.ts
```

## Conteúdo completo

```ts
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
      lista = lista.filter((item) =>
        item.cliente.toLowerCase().includes(busca),
      );
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
```

---

# PARTE 7 — AJUSTAR FORMULÁRIO

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.ts
```

## Conteúdo completo

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { StatusSolicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-solicitacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './solicitacao-form.html',
  styleUrls: ['./solicitacao-form.scss'],
})
export class SolicitacaoFormComponent implements OnInit {
  cliente = '';
  documento = '';
  valor: number = 0;

  modoEdicao = false;
  idEdicao: string | null = null;

  nomeInvalido = false;
  cpfInvalido = false;

  constructor(
    private facade: SolicitacoesFacade,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.modoEdicao = true;
      this.idEdicao = idParam;

      const item = this.facade.getById(idParam);

      if (item) {
        this.cliente = item.cliente;
        this.documento = item.documento;
        this.valor = item.valor;
      }
    }
  }

  apenasNumeros(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '');
    this.documento = input.value;
  }

  async salvar() {
    this.nomeInvalido = this.cliente.trim() === '';
    this.cpfInvalido = !/^\d{11}$/.test(this.documento);

    if (this.nomeInvalido || this.cpfInvalido) {
      return;
    }

    const dados = {
      cliente: this.cliente.trim(),
      documento: this.documento,
      valor: this.valor,
      dataSolicitacao: new Date().toISOString(),
      status: 'pendente' as StatusSolicitacao,
    };

    if (this.modoEdicao && this.idEdicao) {
      await this.facade.editar(this.idEdicao, dados);
    } else {
      await this.facade.criar(dados);
    }

    this.router.navigate(['/solicitacoes']);
  }

  cancelar() {
    this.router.navigate(['/solicitacoes']);
  }
}
```

---

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.html
```

## Conteúdo completo

```html
<div class="form-container">
  <h2>
    {{ modoEdicao ? ('FORM.EDIT' | translate) : ('FORM.NEW' | translate) }}
  </h2>

  <form (ngSubmit)="salvar()" novalidate>
    <label for="cliente">
      {{ 'FORM.CLIENT' | translate }}
    </label>

    <input
      id="cliente"
      type="text"
      [(ngModel)]="cliente"
      name="cliente"
      [placeholder]="'FORM.PLACEHOLDER_CLIENT' | translate"
      [attr.aria-invalid]="nomeInvalido"
      aria-describedby="erro-cliente"
    />

    @if (nomeInvalido) {
      <small id="erro-cliente" class="erro" aria-live="polite">
        {{ 'FORM.ERROR_NAME' | translate }}
      </small>
    }

    <label for="documento">
      {{ 'FORM.CPF' | translate }}
    </label>

    <input
      id="documento"
      type="text"
      [(ngModel)]="documento"
      name="documento"
      [placeholder]="'FORM.PLACEHOLDER_CPF' | translate"
      maxlength="11"
      inputmode="numeric"
      (input)="apenasNumeros($event)"
      [attr.aria-invalid]="cpfInvalido"
      aria-describedby="erro-documento"
    />

    @if (cpfInvalido) {
      <small id="erro-documento" class="erro" aria-live="polite">
        {{ 'FORM.ERROR_CPF' | translate }}
      </small>
    }

    <label for="valor">
      {{ 'FORM.VALUE' | translate }}
    </label>

    <input
      id="valor"
      type="number"
      [(ngModel)]="valor"
      name="valor"
      [placeholder]="'FORM.PLACEHOLDER_VALUE' | translate"
    />

    <div class="form-acoes">
      <button class="btn-salvar" type="submit">
        {{ 'FORM.SAVE' | translate }}
      </button>

      <button class="btn-cancelar" type="button" (click)="cancelar()">
        {{ 'FORM.CANCEL' | translate }}
      </button>
    </div>
  </form>
</div>
```

---


# AJUSTAR DETALHES

# solicitacao-detalhes.ts

```ts 
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';

@Component({
  selector: 'app-solicitacao-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacao-detalhe.html',
  styleUrl: './solicitacao-detalhe.scss',
})
export class SolicitacaoDetalheComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public facade = inject(SolicitacoesFacade);

  id = signal<string | null>(null);

  item = computed(() => {
    const idValue = this.id();

    if (!idValue) {
      return undefined;
    }

    return this.facade.lista().find((solicitacao) => solicitacao.id === idValue);
  });

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');

    this.id.set(routeId);
    this.facade.carregar();
  }

  async aprovar() {
    const idValue = this.id();

    if (!idValue) {
      return;
    }

    await this.facade.atualizarStatus(idValue, 'aprovado');

    this.router.navigate(['/solicitacoes']);
  }

  async reprovar() {
    const idValue = this.id();

    if (!idValue) {
      return;
    }

    await this.facade.atualizarStatus(idValue, 'recusado');

    this.router.navigate(['/solicitacoes']);
  }
}
``` 


# solicitacao-detalhes.html

```html
 <div class="detalhe-container">
  <button class="btn-back" routerLink="/solicitacoes">← Voltar para a lista</button>

  @if (item(); as solicitacao) {
    <header class="detalhe-header">
      <h1>{{ solicitacao.cliente }}</h1>

      <span class="status-badge" [ngClass]="solicitacao.statusClass">
        {{ solicitacao.statusLabel }}
      </span>
    </header>

    <section class="detalhe-content">
      <div class="info-group">
        <span class="label">Documento</span>
        <span class="value">{{ solicitacao.documento }}</span>
      </div>

      <div class="info-group">
        <span class="label">Valor Solicitado</span>
        <span class="value value--destaque">
          {{ solicitacao.valor | currency: 'BRL' }}
        </span>
      </div>

      <div class="info-group">
        <span class="label">Data da Solicitação</span>
        <span class="value">
          {{ solicitacao.dataSolicitacao | date: 'dd/MM/yyyy' }}
        </span>
      </div>
    </section>

    <div class="detalhe-actions">
      <button type="button" class="btn-aprovar" (click)="aprovar()">Aprovar</button>

      <button type="button" class="btn-reprovar" (click)="reprovar()">Reprovar</button>
    </div>
  } @else {
    <p>Carregando solicitação...</p>
  }
</div>

``` 

# PARTE 8 — AJUSTAR LISTA DE SOLICITAÇÕES

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.html
```

## Conteúdo completo

```html
<app-header [title]="'APP.TITLE' | translate"></app-header>

<div class="page-container">
  @if (facade.feedback()) {
    <div class="feedback" aria-live="polite" role="status">
      {{ facade.feedback() }}
    </div>
  }

  <app-resumo-solicitacoes [lista]="facade.listaFiltrada()"></app-resumo-solicitacoes>

  <div class="top-bar">
    <div class="left">
      <button type="button" class="btn-novo" (click)="irParaNova()">
        {{ 'ACTIONS.NEW_REQUEST' | translate }}
      </button>

      <app-busca-solicitacoes
        (buscaChange)="facade.aplicarBusca($event)"
      ></app-busca-solicitacoes>
    </div>

    <div class="right">
      <app-filtro-solicitacoes
        (filtroChange)="facade.aplicarFiltro($event)"
      ></app-filtro-solicitacoes>
    </div>
  </div>

  <div class="lista">
    <div *ngFor="let item of facade.listaFiltrada(); trackBy: trackById">
      <app-solicitacao-item [solicitacao]="item"></app-solicitacao-item>
    </div>
  </div>
</div>
```

---

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.scss
```

## Conteúdo completo

```scss
/* CONTAINER PRINCIPAL */
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--page-bg);
  color: var(--text-main);
  min-height: 100vh;
}

/* FEEDBACK ACESSÍVEL */
.feedback {
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-main);
  border: 1px solid var(--border);
  font-weight: 600;
  box-shadow: var(--shadow);
}

/* RESUMO */
app-resumo-solicitacoes {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: var(--text-muted);
}

/* TOP BAR */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  flex-wrap: wrap;
}

/* AGRUPAMENTO */
.top-bar .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-bar .right {
  display: flex;
  align-items: center;
}

/* BOTÃO NOVO */
.btn-novo {
  padding: 10px 16px;
  background: #16a34a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-novo:hover {
  background: #15803d;
}

.btn-novo:focus {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}

/* INPUT BUSCA */
app-busca-solicitacoes input {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  min-width: 220px;
  outline: none;
  transition: 0.2s;
  background: var(--input-bg);
  color: var(--text-main);
}

app-busca-solicitacoes input::placeholder {
  color: var(--text-muted);
}

app-busca-solicitacoes input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* SELECT FILTRO */
app-filtro-solicitacoes select {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--text-main);
  cursor: pointer;
}

app-filtro-solicitacoes select:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* GRID DA LISTA */
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
  margin-top: 16px;
}

/* LOADING */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
}

.loading__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading__text {
  margin-top: 1rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* EMPTY */
.empty {
  text-align: center;
  padding: 4rem 0;
}

.empty__text {
  color: var(--text-muted);
  font-size: 1rem;
}

/* VIRTUAL SCROLL */
.viewport {
  height: 600px;
  width: 100%;
}

::ng-deep .cdk-virtual-scroll-content-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
  padding: 1rem;
  box-sizing: border-box;
}

/* ANIMAÇÃO */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .top-bar .left,
  .top-bar .right {
    width: 100%;
    justify-content: space-between;
  }

  app-busca-solicitacoes input,
  app-filtro-solicitacoes select {
    width: 100%;
  }

  .lista {
    grid-template-columns: 1fr;
  }
}
```

---

# PARTE 9 — AJUSTAR ITEM DO CARD

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-item/solicitacao-item.ts
```

## Conteúdo completo

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitacaoItemComponent {
  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;

  constructor(
    private router: Router,
    private facade: SolicitacoesFacade,
  ) {}

  irParaDetalhe() {
    if (!this.solicitacao.id) {
      return;
    }

    this.router.navigate(['/solicitacoes', this.solicitacao.id]);
  }

  editar() {
    if (!this.solicitacao.id) {
      return;
    }

    this.router.navigate(['/solicitacoes/editar', this.solicitacao.id]);
  }

  deletar() {
    if (!this.solicitacao.id) {
      return;
    }

    this.facade.deletar(this.solicitacao.id);
  }
}
```

---

## Arquivo

```txt
src/app/components/solicitacoes/solicitacao-item/solicitacao-item.html
```

## Conteúdo completo

```html
<div class="card">
  <div class="card__header">
    <h3 class="card__cliente">{{ solicitacao.cliente }}</h3>

    <span
      (click)="irParaDetalhe()"
      class="card__status"
      [ngClass]="solicitacao.statusClass"
      role="button"
      tabindex="0"
      [attr.aria-label]="
        ('ACCESSIBILITY.OPEN_REQUEST' | translate) + ' ' + solicitacao.cliente
      "
    >
      {{ solicitacao.statusLabel }}
    </span>
  </div>

  <div class="card__body">
    <div class="card__info">
      <span class="card__label">
        {{ 'FORM.CPF' | translate }}
      </span>

      <span class="card__value">
        {{ solicitacao.documento }}
      </span>
    </div>

    <div class="card__info">
      <span class="card__label">
        {{ 'FORM.VALUE' | translate }}
      </span>

      <span class="card__value card__value--destaque">
        {{ solicitacao.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
      </span>
    </div>

    <div class="card__info">
      <span class="card__label">
        {{ 'REQUEST.DATE' | translate }}
      </span>

      <span class="card__value">
        {{ solicitacao.dataSolicitacao | date: 'dd/MM/yyyy' }}
      </span>
    </div>
  </div>

  <div class="card__acoes">
    <button
      type="button"
      (click)="editar(); $event.stopPropagation()"
      [attr.aria-label]="
        ('ACCESSIBILITY.EDIT_REQUEST' | translate) + ' ' + solicitacao.cliente
      "
    >
      {{ 'ACTIONS.EDIT' | translate }}
    </button>

    <button
      type="button"
      (click)="irParaDetalhe(); $event.stopPropagation()"
      [attr.aria-label]="
        ('ACCESSIBILITY.ANALYZE_REQUEST' | translate) + ' ' + solicitacao.cliente
      "
    >
      {{ 'ACTIONS.ANALYZE' | translate }}
    </button>

    <button
      type="button"
      (click)="deletar(); $event.stopPropagation()"
      [attr.aria-label]="
        ('ACCESSIBILITY.DELETE_REQUEST' | translate) + ' ' + solicitacao.cliente
      "
    >
      {{ 'ACTIONS.DELETE' | translate }}
    </button>
  </div>
</div>
```

---

# PARTE 10 — AJUSTAR ESTILOS GLOBAIS

## Arquivo

```txt
src/styles.scss
```

## Conteúdo completo

```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root,
body.light-theme {
  --page-bg: #f8fafc;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --text-main: #1a1a2e;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --hover-bg: #f9fafb;
  --shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

body.dark-theme {
  --page-bg: #0f172a;
  --card-bg: #111827;
  --input-bg: #1f2937;
  --text-main: #f9fafb;
  --text-muted: #cbd5e1;
  --border: #374151;
  --hover-bg: #1f2937;
  --shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  background: var(--page-bg);
}

body {
  margin: 0;
  background: var(--page-bg);
  color: var(--text-main);
  font-family: 'Inter', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
select {
  font-family: inherit;
}

button:focus,
a:focus,
input:focus,
select:focus,
[role='button']:focus {
  outline: 3px solid rgba(99, 102, 241, 0.45);
  outline-offset: 2px;
}

.cdk-virtual-scroll-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}
```

---

# PARTE 11 — AJUSTAR ARQUIVOS DE TRADUÇÃO

## Arquivo

```txt
public/assets/i18n/pt-BR.json
```

Adicionar ou ajustar as chaves:

```json
{
  "FORM": {
    "NEW": "Nova Solicitação",
    "EDIT": "Editar Solicitação",
    "CLIENT": "Nome do cliente",
    "CPF": "CPF",
    "VALUE": "Valor solicitado",
    "PLACEHOLDER_CLIENT": "Digite o nome do cliente",
    "PLACEHOLDER_CPF": "Digite somente os 11 números do CPF",
    "PLACEHOLDER_VALUE": "Digite o valor solicitado",
    "SAVE": "Salvar",
    "CANCEL": "Cancelar",
    "ERROR_NAME": "Nome é obrigatório.",
    "ERROR_CPF": "CPF deve conter exatamente 11 números."
  },
  "ACCESSIBILITY": {
    "OPEN_REQUEST": "Abrir detalhes da solicitação de",
    "EDIT_REQUEST": "Editar solicitação de",
    "ANALYZE_REQUEST": "Analisar solicitação de",
    "DELETE_REQUEST": "Excluir solicitação de"
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/en-US.json
```

Adicionar ou ajustar as chaves:

```json
{
  "FORM": {
    "NEW": "New Request",
    "EDIT": "Edit Request",
    "CLIENT": "Client name",
    "CPF": "CPF",
    "VALUE": "Requested amount",
    "PLACEHOLDER_CLIENT": "Enter the client name",
    "PLACEHOLDER_CPF": "Enter only the 11 CPF digits",
    "PLACEHOLDER_VALUE": "Enter the requested amount",
    "SAVE": "Save",
    "CANCEL": "Cancel",
    "ERROR_NAME": "Name is required.",
    "ERROR_CPF": "CPF must contain exactly 11 digits."
  },
  "ACCESSIBILITY": {
    "OPEN_REQUEST": "Open request details from",
    "EDIT_REQUEST": "Edit request from",
    "ANALYZE_REQUEST": "Analyze request from",
    "DELETE_REQUEST": "Delete request from"
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/es-ES.json
```

Adicionar ou ajustar as chaves:

```json
{
  "FORM": {
    "NEW": "Nueva Solicitud",
    "EDIT": "Editar Solicitud",
    "CLIENT": "Nombre del cliente",
    "CPF": "CPF",
    "VALUE": "Valor solicitado",
    "PLACEHOLDER_CLIENT": "Ingrese el nombre del cliente",
    "PLACEHOLDER_CPF": "Ingrese solo los 11 números del CPF",
    "PLACEHOLDER_VALUE": "Ingrese el valor solicitado",
    "SAVE": "Guardar",
    "CANCEL": "Cancelar",
    "ERROR_NAME": "El nombre es obligatorio.",
    "ERROR_CPF": "El CPF debe contener exactamente 11 números."
  },
  "ACCESSIBILITY": {
    "OPEN_REQUEST": "Abrir detalles de la solicitud de",
    "EDIT_REQUEST": "Editar solicitud de",
    "ANALYZE_REQUEST": "Analizar solicitud de",
    "DELETE_REQUEST": "Eliminar solicitud de"
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/it-IT.json
```

Adicionar ou ajustar as chaves:

```json
{
  "FORM": {
    "NEW": "Nuova Richiesta",
    "EDIT": "Modifica Richiesta",
    "CLIENT": "Nome del cliente",
    "CPF": "CPF",
    "VALUE": "Valore richiesto",
    "PLACEHOLDER_CLIENT": "Inserisci il nome del cliente",
    "PLACEHOLDER_CPF": "Inserisci solo gli 11 numeri del CPF",
    "PLACEHOLDER_VALUE": "Inserisci il valore richiesto",
    "SAVE": "Salva",
    "CANCEL": "Annulla",
    "ERROR_NAME": "Il nome è obbligatorio.",
    "ERROR_CPF": "Il CPF deve contenere esattamente 11 numeri."
  },
  "ACCESSIBILITY": {
    "OPEN_REQUEST": "Apri dettagli della richiesta di",
    "EDIT_REQUEST": "Modifica richiesta di",
    "ANALYZE_REQUEST": "Analizza richiesta di",
    "DELETE_REQUEST": "Elimina richiesta di"
  }
}
```

---

# PARTE 12 — TESTAR A LISTA COM FIRESTORE

## Passo a passo

```txt
1. Fazer login.
2. Acessar /solicitacoes.
3. Confirmar que o documento criado manualmente aparece na lista.
4. Abrir o Firebase Console.
5. Acessar Firestore Database.
6. Entrar na coleção solicitacoes.
7. Confirmar que o documento está salvo no Firestore.
```

---

# PARTE 13 — CRIAR MAIS SOLICITAÇÕES PELA TELA

## Passo a passo

Acessar:

```txt
/solicitacoes
```

Clicar em:

```txt
Nova Solicitação
```

Criar as solicitações abaixo.

---

## Solicitação 1

```txt
Nome do cliente: Carlos Lima
CPF: 98765432100
Valor solicitado: 12000
```

Salvar.

---

## Solicitação 2

```txt
Nome do cliente: Mariana Costa
CPF: 45678912300
Valor solicitado: 8500
```

Salvar.

---

## Solicitação 3

```txt
Nome do cliente: Fernanda Alves
CPF: 78912345600
Valor solicitado: 15000
```

Salvar.

---

## Conferir no Firebase

Acessar:

```txt
Firestore Database
solicitacoes
```

Confirmar que os novos documentos foram criados.

---

# PARTE 14 — TESTAR BUSCA, FILTRO E CARDS

## Passo a passo

```txt
1. Acessar /solicitacoes.
2. Buscar por Carlos.
3. Confirmar que o card de Carlos Lima aparece.
4. Limpar a busca.
5. Usar o filtro de status.
6. Confirmar que os cards mudam conforme o status.
7. Clicar em Editar.
8. Confirmar que abriu a tela de edição.
9. Voltar para /solicitacoes.
10. Clicar em Analisar.
11. Confirmar que abriu a tela de detalhes.
12. Clicar em Excluir.
13. Confirmar que o card foi removido.
14. Conferir no Firestore se o documento foi removido.
```

---

# PARTE 15 — TESTAR FEEDBACK ACESSÍVEL

## Passo a passo

```txt
1. Criar uma nova solicitação.
2. Voltar para /solicitacoes.
3. Confirmar que aparece a mensagem de feedback.
4. Editar uma solicitação.
5. Confirmar que aparece a mensagem de atualização.
6. Excluir uma solicitação.
7. Confirmar que aparece a mensagem de exclusão.
```

---

# PARTE 16 — TESTAR ACESSIBILIDADE COM TECLADO

## Lista

```txt
1. Acessar /solicitacoes.
2. Pressionar Tab.
3. Confirmar foco nos links do header.
4. Confirmar foco no botão Nova Solicitação.
5. Confirmar foco no campo de busca.
6. Confirmar foco no filtro.
7. Confirmar foco nos botões dos cards.
8. Pressionar Enter em Editar.
9. Confirmar que a ação funciona.
```

---

## Formulário

```txt
1. Acessar /solicitacoes/nova.
2. Navegar com Tab pelos campos.
3. Deixar o nome vazio.
4. Informar CPF inválido.
5. Pressionar Salvar.
6. Confirmar mensagens de erro.
7. Preencher corretamente.
8. Pressionar Salvar.
9. Confirmar criação da solicitação.
```

---

# PARTE 17 — TESTAR COM LIGHTHOUSE

## Passo a passo

```txt
1. Abrir DevTools.
2. Acessar a aba Lighthouse.
3. Selecionar Accessibility.
4. Rodar o teste.
5. Verificar contraste.
6. Verificar labels.
7. Verificar nomes acessíveis.
8. Verificar estrutura semântica.
9. Verificar foco visível.
```

---

# PARTE 18 — CHECKLIST FINAL

## Firebase

```txt
[ ] Coleção solicitacoes criada.
[ ] Primeiro documento criado manualmente.
[ ] Regras do Firestore publicadas.
[ ] Lista carrega dados do Firestore.
[ ] Formulário cria documentos no Firestore.
[ ] Edição atualiza documento no Firestore.
[ ] Exclusão remove documento do Firestore.
[ ] Atividades são registradas.
```

---

## Código

```txt
[ ] solicitacao.model.ts ajustado.
[ ] atividade.model.ts ajustado.
[ ] graphql.service.ts ajustado.
[ ] solicitacoes.facade.ts ajustado.
[ ] solicitacao-form.ts ajustado.
[ ] solicitacao-form.html ajustado.
[ ] solicitacao-lista.html ajustado.
[ ] solicitacao-lista.scss ajustado.
[ ] solicitacao-item.ts ajustado.
[ ] solicitacao-item.html ajustado.
[ ] styles.scss ajustado.
[ ] Arquivos de tradução ajustados.
```

---

## Acessibilidade

```txt
[ ] Inputs têm labels.
[ ] Mensagens de erro usam aria-live.
[ ] Campos inválidos usam aria-invalid.
[ ] Inputs apontam para mensagens com aria-describedby.
[ ] Botões têm aria-label com contexto.
[ ] Feedback usa aria-live.
[ ] Feedback usa role="status".
[ ] Foco visual aparece com Tab.
[ ] Aplicação funciona sem mouse.
[ ] Lighthouse Accessibility foi executado.
```
