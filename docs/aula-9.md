# AULA 9 — REFATORAÇÃO ARQUITETURAL E ESTADO REATIVO (PASSO A PASSO COMPLETO)

## OBJETIVO DA AULA

- organizar arquitetura (Facade)
- separar responsabilidades (Smart vs Dumb)
- centralizar estado
- evitar múltiplas chamadas
- adicionar persistência real (localStorage)
- evoluir o sistema com CRUD (criar, editar, deletar)

---

# BLOCO 1 — PROBLEMA (INÍCIO DA AULA)

## DEMO

1. aprovar um item  
2. criar novo item  
3. editar um item  
4. excluir um item  
5. atualizar a página (F5)  

# Tudo volta ao estado inicial

## CONCLUSÃO

- estado está em memória  
- qualquer ação (criar, editar, excluir) é perdida  
- componente faz muita coisa  
- não escala  

---

# ESTRUTURA FINAL DO PROJETO

Tudo que foi criado ou modificado:

src/app/

- services/
  - graphql.service.ts          ← atualizado (persistência)
  - solicitacoes.facade.ts      ← novo (centraliza estado)

- components/
  - solicitacoes/
    - solicitacao-lista/        ← atualizado (usa facade)
    - solicitacao-item/         ← atualizado (editar e excluir)
    - solicitacao-form/         ← novo (criar e editar)
    - solicitacao-detalhe/      ← existente (sem mudanças)

- app.routes.ts                ← atualizado (novas rotas)


---

# BLOCO 2 — CRIAR FACADE

##  CRIAR ARQUIVO

src/app/services/solicitacoes.facade.ts

## COLAR O CÓDIGO

```ts
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
      lista = lista.filter(i => i.status === filtro);
    }

    if (busca) {
      lista = lista.filter(i =>
        i.cliente.toLowerCase().includes(busca)
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

  private atualizarLista(lista: SolicitacaoViewModel[]) {
    this._solicitacoes.set(lista);
    this.service.salvar(lista);
  }

  atualizarStatus(id: number | string, status: StatusSolicitacao) {
    const lista = this._solicitacoes().map(item =>
      String(item.id) === String(id)
        ? { ...item, status }
        : item
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
    const lista = atual.map(item =>
      String(item.id) === String(id) ? atualizado : item
    );
    this.atualizarLista(lista);
  }

  deletar(id: number | string) {
    const atual = this.service.getDadosPersistidos();
    const lista = atual.filter(item =>
      String(item.id) !== String(id)
    );
    this.atualizarLista(lista);
  }

  getById(id: number | string) {
    return this._solicitacoes().find(item =>
      String(item.id) === String(id)
    );
  }
}
```


# BLOCO 3 — REFATORAR LISTA (SMART → DUMB)

## 📁 EDITAR

src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.ts

## SUBSTITUIR

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { HeaderComponent } from '../../shared/header/header';
import { FiltroSolicitacoesComponent } from '../filtro-solicitacoes/filtro-solicitacoes';
import { ResumoSolicitacoesComponent } from '../resumo-solicitacoes/resumo-solicitacoes';
import { BuscaSolicitacoesComponent } from '../busca-solicitacoes/busca-solicitacoes';
import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    SolicitacaoItemComponent,
    HeaderComponent,
    FiltroSolicitacoesComponent,
    ResumoSolicitacoesComponent,
    BuscaSolicitacoesComponent
  ],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public facade: SolicitacoesFacade,  private router: Router) {}

  ngOnInit() {
    this.facade.carregar();
  }

   irParaNova() {
    this.router.navigate(['/solicitacoes/nova']);
  }

  trackById(index: number, item: SolicitacaoViewModel) {
    return item.id;
  }
}
```

---

## 📁 EDITAR HTML

solicitacao-lista.html

```html
<div class="page-container">

  <!-- HEADER -->
  <app-header title="Solicitações de Crédito"></app-header>

  <!-- RESUMO -->
  <app-resumo-solicitacoes 
    [lista]="facade.listaFiltrada()">
  </app-resumo-solicitacoes>

  <!-- TOP BAR -->
  <div class="top-bar">

    <!-- ESQUERDA -->
    <div class="left">
      <button class="btn-novo" (click)="irParaNova()">
        Nova Solicitação
      </button>

      <app-busca-solicitacoes 
        (buscaChange)="facade.aplicarBusca($event)">
      </app-busca-solicitacoes>
    </div>

    <!-- DIREITA -->
    <div class="right">
      <app-filtro-solicitacoes 
        (filtroChange)="facade.aplicarFiltro($event)">
      </app-filtro-solicitacoes>
    </div>

  </div>

  <!-- LISTA -->
  <div class="lista">
    <div *ngFor="let item of facade.listaFiltrada(); trackBy: trackById">
      <app-solicitacao-item 
        [solicitacao]="item">
      </app-solicitacao-item>
    </div>
  </div>

</div>
```

---

# BLOCO 4 — PERSISTÊNCIA (LOCALSTORAGE)

## 📁 EDITAR

src/app/services/graphql.service.ts

## ADICIONAR

```ts
import { Injectable, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';

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

  getDadosPersistidos(): SolicitacaoViewModel[] {
    const dados = localStorage.getItem('solicitacoes');

    if (dados) {
      const lista = JSON.parse(dados);

      return lista.map((item: any) =>
        this.mapToViewModel({
          ...item,
          status: item.status as StatusSolicitacao
        })
      );
    }

    return [];
  }

  salvar(lista: SolicitacaoViewModel[]) {
    localStorage.setItem('solicitacoes', JSON.stringify(lista));
  }

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
      fetchPolicy: 'cache-first'
    }).subscribe({
      next: (result) => {
        const data = result.data?.solicitacoes || [];
        const viewModel = data.map(s => this.mapToViewModel(s));

        this.solicitacoes.set(viewModel);

        this.salvar(viewModel);

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
      status: status as StatusSolicitacao, // ✅ GARANTE TIPO
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? s.status
    };
  }

  atualizarStatus(id: number | string, novoStatus: StatusSolicitacao) {
    this.solicitacoes.update(lista => {
      const novaLista = lista.map(item =>
        String(item.id) === String(id)
          ? this.mapToViewModel({ ...item, status: novoStatus })
          : item
      );

      this.salvar(novaLista);

      return novaLista;
    });
  }
}
```

---

### ALTERAR O SERVICE PELO FACADE NO COMPONENTE DETALHES 

# solicitacao-detalhes.component.ts

```ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacoesService } from '../../../services/graphql.service';
import { CommonModule } from '@angular/common';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';

@Component({
  selector: 'app-solicitacao-detalhe',
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacao-detalhe.component.html',
  styleUrl: './solicitacao-detalhe.component.scss'
})
export class SolicitacaoDetalheComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  public service = inject(SolicitacoesService)
  public facade = inject(SolicitacoesFacade)
  id!: number;


  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));  
  }

  get item() {
    return this.facade.getById(this.id)

  }

  aprovar() {
    this.facade.atualizarStatus(this.id, 'aprovado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }

  reprovar() {
    this.facade.atualizarStatus(this.id, 'recusado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }
}

 ``` 

---

# BLOCO 5 — CRIAR NOVA PÁGINA

## GERAR COMPONENTE

```bash
ng generate component components/solicitacoes/solicitacao-form --standalone
```

---

## 📁 CONFIGURAR ROTA

src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login/login')
        .then(m => m.LoginComponent)
  },

  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent),
    canActivate: [authGuard]
  },

  // ROTAS ESPECÍFICAS PRIMEIRO

  {
    path: 'solicitacoes/nova',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-form/solicitacao-form')
        .then(m => m.SolicitacaoFormComponent),
    canActivate: [authGuard]
  },

  {
    path: 'solicitacoes/editar/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-form/solicitacao-form')
        .then(m => m.SolicitacaoFormComponent),
    canActivate: [authGuard]
  },

  // ROTA GENÉRICA SEMPRE POR ÚLTIMO

  {
    path: 'solicitacoes/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe')
        .then(m => m.SolicitacaoDetalheComponent),
    canActivate: [authGuard]
  }

];
```

---

## 📁 IMPLEMENTAR FORM

# solicitacao-form.ts$

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { StatusSolicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-solicitacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacao-form.html',
  styleUrls: ['./solicitacao-form.scss']
})
export class SolicitacaoFormComponent implements OnInit {

  cliente = '';
  documento = '';
  valor: number = 0;

  modoEdicao = false;
  idEdicao: number | null = null;

  constructor(
    private facade: SolicitacoesFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);

      this.modoEdicao = true;
      this.idEdicao = id;

      const item = this.facade.getById(id);

      if (item) {
        this.cliente = item.cliente;
        this.documento = item.documento;
        this.valor = item.valor;
      }
    }
  }

  salvar() {
    if (this.modoEdicao && this.idEdicao) {

      this.facade.editar(this.idEdicao, {
        id: this.idEdicao,
        cliente: this.cliente,
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: ''
      });

    } else {

      this.facade.criar({
        id: Date.now(),
        cliente: this.cliente,
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: ''
      });

    }

    this.router.navigate(['/solicitacoes']);
  }

  cancelar() {
    this.router.navigate(['/solicitacoes']);
  }
}
```

solicitacao-form.html
```html
<div class="form-container">
  <h2>{{ modoEdicao ? 'Editar Solicitação' : 'Nova Solicitação' }}</h2>

  <form (ngSubmit)="salvar()">
    <input type="text" [(ngModel)]="cliente" name="cliente" placeholder="Cliente" required />

    <input type="text" [(ngModel)]="documento" name="documento" placeholder="Documento" required />

    <input type="number" [(ngModel)]="valor" name="valor" placeholder="Valor" required />

    <div class="form-acoes">
      <button class="btn-salvar" type="submit">Salvar</button>
      <button class="btn-cancelar" type="button" (click)="cancelar()">Cancelar</button>
    </div>
  </form>
</div>
``` 

solicitacao-form.scss

```scss
:host {
  display: block;
  background: #f5f6fa;
  min-height: 100vh;
  padding: 2rem;
}

/* CONTAINER CENTRAL */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* TÍTULO */
.form-container h2 {
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #1a1a2e;
}

/* FORM */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* INPUTS */
input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* BOTÕES */
.form-acoes {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* BOTÃO SALVAR */
.btn-salvar {
  flex: 1;
  background: #16a34a;
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-salvar:hover {
  background: #15803d;
}

/* BOTÃO CANCELAR */
.btn-cancelar {
  flex: 1;
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.7rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancelar:hover {
  background: #e5e7eb;
}

``` 

---
# BLOCO 6 — ALTERAR COMPONENTE DE ITEM


solicitacao-item.ts
```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitacaoItemComponent {

  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;

  constructor(
    private router: Router,
    private facade: SolicitacoesFacade
  ) {}

  irParaDetalhe() {
    this.router.navigate(['/solicitacoes', this.solicitacao.id]);
  }

  editar() {
  this.router.navigate(['/solicitacoes/editar', this.solicitacao.id]);
}

  deletar() {
    this.facade.deletar(this.solicitacao.id);
  }
}
```

solicitacao-item.html
```html
<div class="card" (click)="irParaDetalhe()">

  <div class="card__header">
    <h3 class="card__cliente">{{ solicitacao.cliente }}</h3>

    <span class="card__status" [ngClass]="solicitacao.statusClass">
      {{ solicitacao.statusLabel }}
    </span>
  </div>

  <div class="card__body">

    <div class="card__info">
      <span class="card__label">Documento</span>
      <span class="card__value">{{ solicitacao.documento }}</span>
    </div>

    <div class="card__info">
      <span class="card__label">Valor Solicitado</span>
      <span class="card__value card__value--destaque">
        {{ solicitacao.valor | currency : "BRL" : "symbol" : "1.2-2" : "pt-BR" }}
      </span>
    </div>

    <div class="card__info">
      <span class="card__label">Data da Solicitação</span>
      <span class="card__value">
        {{ solicitacao.dataSolicitacao | date : "dd/MM/yyyy" }}
      </span>
    </div>

  </div>

  <!-- AÇÕES FORA DO BODY -->
  <div class="card__acoes">
    <button (click)="editar(); $event.stopPropagation()">Editar</button>
    <button (click)="deletar(); $event.stopPropagation()">Excluir</button>
  </div>

</div>
```

solicitacao-item.scss
```scss
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  border: 1px solid #e8e8e8;
  cursor: pointer;

  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
  }

  &__cliente {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
  }

  &__status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-size: 0.85rem;
    color: #6b7280;
  }

  &__value {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;

    &--destaque {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a2e;
    }
  }

  /* ÁREA DE AÇÕES SEPARADA */
  &__acoes {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  &__acoes button {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* BOTÃO EDITAR */
  &__acoes button:first-child {
    background-color: #2563eb;
    color: #ffffff;

    &:hover {
      background-color: #1d4ed8;
    }
  }

  /* BOTÃO EXCLUIR */
  &__acoes button:last-child {
    background-color: #dc2626;
    color: #ffffff;

    &:hover {
      background-color: #b91c1c;
    }
  }
}

/* STATUS (FORA DO BLOCO PARA FUNCIONAR COM ngClass) */
.card__status {
  &--pendente {
    background-color: #fef3c7;
    color: #92400e;
  }

  &--analise {
    background-color: #dbeafe;
    color: #1e40af;
  }

  &--aprovado {
    background-color: #d1fae5;
    color: #065f46;
  }

  &--recusado {
    background-color: #fee2e2;
    color: #991b1b;
  }
}
``` 
# BLOCO 7 — ATUALIZAR SERVICE + CRIAR STORAGE TOKEN

## OBJETIVO

- adicionar cache com shareReplay  
- remover string fixa do localStorage  
- preparar o service para escala  

---

## PASSO 1 — CRIAR TOKEN DE STORAGE

📁 src/app/services/storage.token.ts

```ts
import { InjectionToken } from '@angular/core';

export const STORAGE_KEY = new InjectionToken<string>('storageKey');
```

---

## PASSO 2 — REGISTRAR TOKEN

📁 src/app/app.config.ts

```ts
import { STORAGE_KEY } from './services/storage.token';
```

Adicionar em providers:

```ts
{
  provide: STORAGE_KEY,
  useValue: 'solicitacoes'
}
```

---

## PASSO 3 — AJUSTAR SERVICE

📁 src/app/services/graphql.service.ts

### 1. IMPORTAR

```ts
import { Inject } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { STORAGE_KEY } from './storage.token';
```

---

### 2. AJUSTAR CONSTRUCTOR

```ts
constructor(
  private apollo: Apollo,
  @Inject(STORAGE_KEY) private storageKey: string
) {}
```

---

### 3. CRIAR MÉTODO COM CACHE (shareReplay)

```ts
getSolicitacoes$() {
  return this.apollo.query<{ solicitacoes: Solicitacao[] }>({
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
    fetchPolicy: 'cache-first'
  }).pipe(
    map(result => result.data?.solicitacoes || []),
    shareReplay(1)
  );
}
```

---

### 4. TROCAR LOCALSTORAGE FIXO

ANTES:

```ts
localStorage.getItem('solicitacoes');
localStorage.setItem('solicitacoes', ...);
```

DEPOIS:

```ts
localStorage.getItem(this.storageKey);
localStorage.setItem(this.storageKey, ...);
```

---

### 5. USAR O MÉTODO NO CARREGAMENTO

```ts
this.getSolicitacoes$().subscribe(...)
```


## Arquivo completo 

```ts
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
  providedIn: 'root'
})
export class SolicitacoesService {

  constructor(
    private apollo: Apollo,
    @Inject(STORAGE_KEY) private storageKey: string
  ) {}

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // MÉTODO COM CACHE (shareReplay)
  getSolicitacoes$() {
    return this.apollo.query<{ solicitacoes: Solicitacao[] }>({
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
      fetchPolicy: 'cache-first'
    }).pipe(
      map(result => result.data?.solicitacoes || []),
      shareReplay(1)
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
          status: item.status as StatusSolicitacao
        })
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
        const viewModel = data.map(s => this.mapToViewModel(s));

        this.solicitacoes.set(viewModel);
        this.salvar(viewModel);

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao buscar API GraphQL');
        this.loading.set(false);
      }
    });
  }

  // VIEW MODEL
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
      status: status as StatusSolicitacao,
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? s.status
    };
  }

  // ATUALIZAÇÃO DE STATUS
  atualizarStatus(id: number | string, novoStatus: StatusSolicitacao) {
    this.solicitacoes.update(lista => {
      const novaLista = lista.map(item =>
        String(item.id) === String(id)
          ? this.mapToViewModel({ ...item, status: novoStatus })
          : item
      );

      this.salvar(novaLista);
      return novaLista;
    });
  }
}
```

---

## RESULTADO

- API chamada uma única vez (cache)  
- storage configurável (sem string fixa)  
- código mais preparado para crescimento  

---


 
