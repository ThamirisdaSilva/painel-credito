# AULA 6 — PASSO A PASSO (IMPLEMENTAÇÃO COMPLETA)

## OBJETIVO

Evoluir a aplicação com foco em organização, novos componentes e controle de estado:

- criar novos componentes para estruturar melhor a interface  
- melhorar a separação entre componente, service e dados  
- estruturar corretamente o fluxo da aplicação  
- tratar dados antes de renderizar (ViewModel)  
- atualizar estado local sem depender da API  
- evitar renderizações desnecessárias  
- corrigir inconsistências de dados (ex: id, status)  
- preparar a aplicação para crescer com mais dados e novas funcionalidades  

---

## O QUE SERÁ DESENVOLVIDO

- componente de detalhe da solicitação  
- navegação entre lista e detalhe  
- ações de aprovar e reprovar  
- atualização de status em tempo real  
- uso de signal para controle de estado  
- uso de ViewModel para adaptar dados da API  

---

## AJUSTES IMPORTANTES

- evitar recarregar dados da API toda vez que entrar na lista  
- garantir consistência de tipos (string vs number)  
- evitar loops desnecessários no template  
- manter o estado atualizado no frontend  
- evitar sobrescrever dados locais com cache/API  


## 1. CRIAR COMPONENTE DE DETALHE

### gerar componente
```
ng generate component components/solicitacoes/solicitacao-detalhe --standalone
```
---

## 2. CONFIGURAR ROTA

### app.routes.ts
```ts
{
  path: 'solicitacoes/:id',
  loadComponent: () =>
    import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe')
      .then(m => m.SolicitacaoDetalheComponent)
}
```

## 3. AJUSTAR COMPONENTE ITEM (NAVEGAÇÃO) e HTML

### solicitacao-item.ts
```ts
constructor(private router: Router) {}

irParaDetalhe() {
  this.router.navigate(['/solicitacoes', this.solicitacao.id]);
}
```

##  solicitacao-item.html

```html
<div class="card" (click)="irParaDetalhe()">
  <div class="card__header">
    <h3 class="card__cliente">{{ solicitacao.cliente }}</h3>
```


# 4. COMPONENTE DETALHE (TS)
## solicitacao-detalhe.ts
```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacoesService } from '../../../services/graphql.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitacao-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacao-detalhe.html',
  styleUrl: './solicitacao-detalhe.scss'
})
export class SolicitacaoDetalheComponent implements OnInit {

  id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public service: SolicitacoesService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.service.solicitacoes().length === 0) {
      this.service.carregarSolicitacoes();
    }
  }

  get item() {
    return this.service.solicitacoes()
      .find(s => String(s.id) === String(this.id));
  }

  aprovar() {
    this.service.atualizarStatus(this.id, 'aprovado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }

  reprovar() {
    this.service.atualizarStatus(this.id, 'recusado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }
}
```

# 5. COMPONENTE DETALHE (HTML)
## solicitacao-detalhe.html

```html
<div class="detalhe-container">

  <button class="btn-back" routerLink="/solicitacoes">
    ← Voltar para a lista
  </button>

  @if (service.loading()) {
    <p>Carregando...</p>

  } @else if (item) {

    <header class="detalhe-header">
      <h1>{{ item.cliente }}</h1>

      <span class="status-badge" [ngClass]="item.statusClass">
        {{ item.statusLabel }}
      </span>
    </header>

    <section class="detalhe-content">
      <div class="info-group">
        <span class="label">Documento</span>
        <span class="value">{{ item.documento }}</span>
      </div>

      <div class="info-group">
        <span class="label">Valor Solicitado</span>
        <span class="value value--destaque">
          {{ item.valor | currency:'BRL' }}
        </span>
      </div>

      <div class="info-group">
        <span class="label">Data da Solicitação</span>
        <span class="value">
          {{ item.dataSolicitacao | date:'dd/MM/yyyy' }}
        </span>
      </div>
    </section>

    <footer class="detalhe-actions">
      <button class="btn-aprovar" (click)="aprovar()">Aprovar</button>
      <button class="btn-reprovar" (click)="reprovar()">Reprovar</button>
    </footer>

  } @else {
    <p>Item não encontrado</p>
  }

</div>
```

```scss
.detalhe-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px;
  background: #ffffff;
  border-radius: 16px; // Arredondado igual aos cards da imagem
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); // Sombra suave
  font-family: 'Inter', sans-serif; // Ou a fonte que você está usando no projeto
}

.btn-back {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
}

.detalhe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1b;
    margin: 0;
  }
}

.detalhe-content {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;

  .info-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .label {
      color: #6c757d;
      font-size: 16px;
    }

    .value {
      color: #1a1a1b;
      font-weight: 600;
      font-size: 18px;

      &--destaque {
        font-size: 22px;
        font-weight: 800;
      }
    }
  }
}

.detalhe-actions {
  display: flex;
  gap: 16px;

  button {
    flex: 1;
    padding: 14px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;

    &:active {
      transform: scale(0.98);
    }
  }

  .btn-aprovar {
    background-color: #d1fae5; // Verde claro igual ao badge
    color: #065f46;
    
    &:hover { background-color: #a7f3d0; }
  }

  .btn-reprovar {
    background-color: #fee2e2; // Vermelho claro
    color: #991b1b;

    &:hover { background-color: #fecaca; }
  }
}

/* Badges de Status (mesmas cores da imagem) */
.status-badge {
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.card__status--pendente { background: #fef3c7; color: #92400e; }
.card__status--aprovado { background: #d1fae5; color: #065f46; }
.card__status--recusado { background: #fee2e2; color: #991b1b; }
```

# 6. SERVICE — AJUSTAR ATUALIZAÇÃO DE STATUS
## graphql.service.ts

```ts 
atualizarStatus(id: number | string, novoStatus: StatusSolicitacao) {
  this.solicitacoes.update(lista =>
    lista.map(item =>
      String(item.id) === String(id)
        ? this.mapToViewModel({ ...item, status: novoStatus })
        : item
    )
  );
}
```

# 7. SERVICE — GARANTIR VIEWMODEL
```ts
private mapToViewModel(s: Solicitacao): SolicitacaoViewModel {
  const status = s.status?.toLowerCase() ?? '';

  const classMap = {
    pendente: 'card__status--pendente',
    em_analise: 'card__status--analise',
    aprovado: 'card__status--aprovado',
    recusado: 'card__status--recusado'
  };

  const labelMap = {
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
```

# *ARQUIVO GRAPHQL SERVICE ATUALIZADO*

```ts

import { Injectable, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Solicitacao, StatusSolicitacao} from '../models/solicitacao.model';

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
      fetchPolicy: 'cache-first'
    }).subscribe({
      next: (result) => {
        const data = result.data?.solicitacoes || [];
        const viewModel = data.map(s => this.mapToViewModel(s));
        this.solicitacoes.set(viewModel);
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

atualizarStatus(id: number | string, novoStatus: StatusSolicitacao) {
  this.solicitacoes.update(lista =>
    lista.map(item =>
      String(item.id) === String(id)
        ? this.mapToViewModel({ ...item, status: novoStatus })
        : item
    )
  );
}
}
```

# 8. CORRIGIR LISTA 
## solicitacao-lista.ts
```ts
ngOnInit() {
  if (this.service.solicitacoes().length === 0) {
    this.service.carregarSolicitacoes();
  }
}

```
---

# PASSO 9 — CRIAR COMPONENTE DE FILTRO

```bash
ng generate component components/solicitacoes/filtro-solicitacoes
```

---

# PASSO 10 — FILTRO (TS)

## 📁 filtro-solicitacoes.ts

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filtro-solicitacoes',
  standalone: true,
  templateUrl: './filtro-solicitacoes.html',
  styleUrl: './filtro-solicitacoes.scss'
})
export class FiltroSolicitacoesComponent {

  @Output() filtroChange = new EventEmitter<string>();

  selecionar(status: string) {
    this.filtroChange.emit(status);
  }
}
```

---

# Backend - colocar mais nomes na lista para melhor visualização

```ts
let solicitacoes = [
  { id: 1, cliente: 'Bucky Barnes', documento: '101.202.303-44', valor: 4500, status: 'pendente', dataSolicitacao: '2026-04-01T10:00:00' },
  { id: 2, cliente: 'Carol Danvers', documento: '909.808.707-66', valor: 150000, status: 'aprovado', dataSolicitacao: '2026-04-02T14:30:00' },
  { id: 3, cliente: 'Sheldon Cooper', documento: '111.222.333-44', valor: 25000, status: 'aprovado', dataSolicitacao: '2026-04-03T09:15:00' },
  { id: 4, cliente: 'Rachel Green', documento: '555.666.777-88', valor: 8500, status: 'pendente', dataSolicitacao: '2026-04-05T16:30:00' },
  { id: 5, cliente: 'Barney Stinson', documento: '000.000.001-01', valor: 99999, status: 'aprovado', dataSolicitacao: '2026-04-06T22:00:00' },
  { id: 6, cliente: 'Penny Hofstadter', documento: '444.555.666-77', valor: 1200, status: 'reprovado', dataSolicitacao: '2026-04-07T11:20:00' },
  { id: 7, cliente: 'Chandler Bing', documento: '222.333.444-55', valor: 15000, status: 'aprovado', dataSolicitacao: '2026-04-08T13:45:00' },
  { id: 8, cliente: 'Robin Scherbatsky', documento: '888.777.666-55', valor: 7200, status: 'pendente', dataSolicitacao: '2026-04-09T10:10:00' },
  { id: 9, cliente: 'Joey Tribbiani', documento: '333.222.111-00', valor: 450, status: 'reprovado', dataSolicitacao: '2026-04-10T15:00:00' },
  { id: 10, cliente: 'Ted Mosby', documento: '999.888.777-66', valor: 18000, status: 'pendente', dataSolicitacao: '2026-04-11T08:00:00' },
  { id: 11, cliente: 'Walter White', documento: '123.456.789-10', valor: 500000, status: 'aprovado', dataSolicitacao: '2026-04-12T14:20:00' },
  { id: 12, cliente: 'Jesse Pinkman', documento: '987.654.321-00', valor: 1500, status: 'pendente', dataSolicitacao: '2026-04-12T15:30:00' },
  { id: 13, cliente: 'Tony Stark', documento: '000.000.000-01', valor: 1000000, status: 'aprovado', dataSolicitacao: '2026-04-13T10:00:00' },
  { id: 14, cliente: 'Steve Rogers', documento: '191.819.181-00', valor: 2000, status: 'aprovado', dataSolicitacao: '2026-04-13T11:00:00' },
  { id: 15, cliente: 'Monica Geller', documento: '111.111.111-11', valor: 12500, status: 'aprovado', dataSolicitacao: '2026-04-14T09:00:00' },
  { id: 16, cliente: 'Phoebe Buffay', documento: '222.222.222-22', valor: 3000, status: 'pendente', dataSolicitacao: '2026-04-14T12:00:00' },
  { id: 17, cliente: 'Leonard Hofstadter', documento: '333.333.333-33', valor: 22000, status: 'aprovado', dataSolicitacao: '2026-04-15T14:00:00' },
  { id: 18, cliente: 'Howard Wolowitz', documento: '444.444.444-44', valor: 19000, status: 'aprovado', dataSolicitacao: '2026-04-15T16:45:00' },
  { id: 19, cliente: 'Raj Koothrappali', documento: '555.555.555-55', valor: 45000, status: 'pendente', dataSolicitacao: '2026-04-16T10:30:00' },
  { id: 20, cliente: 'Bernadette Rostenkowski', documento: '666.666.666-66', valor: 35000, status: 'aprovado', dataSolicitacao: '2026-04-16T11:20:00' },
  { id: 21, cliente: 'Amy Farrah Fowler', documento: '777.777.777-77', valor: 28000, status: 'aprovado', dataSolicitacao: '2026-04-17T08:15:00' },
  { id: 22, cliente: 'Lily Aldrin', documento: '888.888.888-88', valor: 5400, status: 'reprovado', dataSolicitacao: '2026-04-17T13:10:00' },
  { id: 23, cliente: 'Marshall Eriksen', documento: '999.999.999-99', valor: 17000, status: 'aprovado', dataSolicitacao: '2026-04-18T09:40:00' },
  { id: 24, cliente: 'Skyler White', documento: '101.101.101-01', valor: 85000, status: 'aprovado', dataSolicitacao: '2026-04-18T15:00:00' },
  { id: 25, cliente: 'Saul Goodman', documento: '202.202.202-02', valor: 12000, status: 'aprovado', dataSolicitacao: '2026-04-19T17:30:00' },
  { id: 26, cliente: 'Gustavo Fring', documento: '303.303.303-03', valor: 90000, status: 'aprovado', dataSolicitacao: '2026-04-19T18:00:00' },
  { id: 27, cliente: 'Mike Ehrmantraut', documento: '404.404.404-04', valor: 15000, status: 'aprovado', dataSolicitacao: '2026-04-20T06:00:00' },
  { id: 28, cliente: 'Hank Schrader', documento: '505.505.505-05', valor: 7000, status: 'pendente', dataSolicitacao: '2026-04-20T09:00:00' },
  { id: 29, cliente: 'Natasha Romanoff', documento: '606.606.606-06', valor: 11000, status: 'aprovado', dataSolicitacao: '2026-04-21T10:00:00' },
  { id: 30, cliente: 'Bruce Banner', documento: '707.070.707-07', valor: 5500, status: 'pendente', dataSolicitacao: '2026-04-21T11:00:00' },
  { id: 31, cliente: 'Thor Odinson', documento: '808.808.808-08', valor: 88000, status: 'aprovado', dataSolicitacao: '2026-04-22T12:00:00' },
  { id: 32, cliente: 'Clint Barton', documento: '909.909.909-09', valor: 4200, status: 'aprovado', dataSolicitacao: '2026-04-22T14:00:00' },
  { id: 33, cliente: 'Peter Parker', documento: '121.212.121-21', valor: 500, status: 'reprovado', dataSolicitacao: '2026-04-23T16:00:00' },
  { id: 34, cliente: 'Wanda Maximoff', documento: '313.313.313-31', valor: 13000, status: 'pendente', dataSolicitacao: '2026-04-23T17:00:00' },
  { id: 35, cliente: 'Vision', documento: '414.414.414-41', valor: 25000, status: 'aprovado', dataSolicitacao: '2026-04-24T08:00:00' },
  { id: 36, cliente: 'Stephen Strange', documento: '515.515.515-51', valor: 60000, status: 'aprovado', dataSolicitacao: '2026-04-24T10:00:00' },
  { id: 37, cliente: 'T-Challa', documento: '616.616.616-61', valor: 999999, status: 'aprovado', dataSolicitacao: '2026-04-25T11:00:00' },
  { id: 38, cliente: 'Sam Wilson', documento: '717.717.717-71', valor: 3500, status: 'pendente', dataSolicitacao: '2026-04-25T12:00:00' },
  { id: 39, cliente: 'Bucky Barnes', documento: '818.818.818-81', valor: 2800, status: 'aprovado', dataSolicitacao: '2026-04-26T09:00:00' },
  { id: 40, cliente: 'Loki Laufeyson', documento: '919.919.919-91', valor: 0, status: 'reprovado', dataSolicitacao: '2026-04-26T14:30:00' },
  { id: 41, cliente: 'Scott Lang', documento: '020.202.020-20', valor: 1500, status: 'pendente', dataSolicitacao: '2026-04-27T10:15:00' },
  { id: 42, cliente: 'Hope van Dyne', documento: '131.313.131-31', valor: 45000, status: 'aprovado', dataSolicitacao: '2026-04-27T11:45:00' },
  { id: 43, cliente: 'Nick Fury', documento: '242.424.242-42', valor: 10000, status: 'aprovado', dataSolicitacao: '2026-04-28T08:00:00' },
  { id: 44, cliente: 'Maria Hill', documento: '353.535.353-53', valor: 8000, status: 'aprovado', dataSolicitacao: '2026-04-28T09:30:00' },
  { id: 45, cliente: 'Gunther CentralPerk', documento: '464.646.464-64', valor: 1200, status: 'pendente', dataSolicitacao: '2026-04-29T16:00:00' },
  { id: 46, cliente: 'Janice Litman', documento: '575.757.575-57', valor: 4000, status: 'reprovado', dataSolicitacao: '2026-04-29T17:15:00' },
  { id: 47, cliente: 'Stuart Bloom', documento: '686.868.686-68', valor: 300, status: 'pendente', dataSolicitacao: '2026-04-30T10:00:00' },
  { id: 48, cliente: 'Wil Wheaton', documento: '797.979.797-79', valor: 15000, status: 'aprovado', dataSolicitacao: '2026-04-30T13:00:00' },
  { id: 49, cliente: 'Ranjit Singh', documento: '808.101.808-11', valor: 5000, status: 'aprovado', dataSolicitacao: '2026-05-01T07:00:00' },
  { id: 50, cliente: 'James McGill', documento: '919.212.919-22', valor: 2500, status: 'pendente', dataSolicitacao: '2026-05-01T15:45:00' },
  { id: 51, cliente: 'Kim Wexler', documento: '121.323.121-33', valor: 120000, status: 'aprovado', dataSolicitacao: '2026-05-02T10:20:00' },
  { id: 52, cliente: 'Nacho Varga', documento: '232.434.232-44', valor: 8000, status: 'reprovado', dataSolicitacao: '2026-05-02T14:10:00' },
  { id: 53, cliente: 'Lalo Salamanca', documento: '343.545.343-55', valor: 200000, status: 'aprovado', dataSolicitacao: '2026-05-03T20:00:00' },
  { id: 54, cliente: 'Tuco Salamanca', documento: '454.656.454-66', valor: 5000, status: 'reprovado', dataSolicitacao: '2026-05-03T21:30:00' },
  { id: 55, cliente: 'Peter Quill', documento: '565.767.565-77', valor: 9000, status: 'pendente', dataSolicitacao: '2026-05-04T11:00:00' },
  { id: 56, cliente: 'Gamora Zen', documento: '676.878.676-88', valor: 15000, status: 'aprovado', dataSolicitacao: '2026-05-04T12:00:00' },
  { id: 57, cliente: 'Rocket Raccoon', documento: '787.989.787-99', valor: 4500, status: 'aprovado', dataSolicitacao: '2026-05-05T09:45:00' },
  { id: 58, cliente: 'Groot Tree', documento: '898.090.898-00', valor: 100, status: 'pendente', dataSolicitacao: '2026-05-05T10:30:00' },
  { id: 59, cliente: 'Drax Destroyer', documento: '909.101.909-11', valor: 1200, status: 'aprovado', dataSolicitacao: '2026-05-06T15:00:00' },
  { id: 60, cliente: 'Nebula Luphomoid', documento: '010.212.010-22', valor: 7000, status: 'aprovado', dataSolicitacao: '2026-05-06T16:20:00' },
  { id: 61, cliente: 'Carol Danvers', documento: '121.323.121-33', valor: 80000, status: 'aprovado', dataSolicitacao: '2026-05-07T08:00:00' },
  { id: 62, cliente: 'Arthur Fonzarelli', documento: '232.434.232-44', valor: 3000, status: 'pendente', dataSolicitacao: '2026-05-07T14:40:00' },
  { id: 63, cliente: 'Richard Webber', documento: '343.545.343-55', valor: 95000, status: 'aprovado', dataSolicitacao: '2026-05-08T10:00:00' },
  { id: 64, cliente: 'Miranda Bailey', documento: '454.656.454-66', valor: 75000, status: 'aprovado', dataSolicitacao: '2026-05-08T11:15:00' },
  { id: 65, cliente: 'Meredith Grey', documento: '565.767.565-77', valor: 110000, status: 'aprovado', dataSolicitacao: '2026-05-09T09:00:00' },
  { id: 66, cliente: 'Cristina Yang', documento: '676.878.676-88', valor: 130000, status: 'aprovado', dataSolicitacao: '2026-05-09T10:30:00' },
  { id: 67, cliente: 'Derek Shepherd', documento: '787.989.787-99', valor: 250000, status: 'aprovado', dataSolicitacao: '2026-05-10T08:20:00' },
  { id: 68, cliente: 'Alex Karev', documento: '898.090.898-00', valor: 45000, status: 'pendente', dataSolicitacao: '2026-05-10T11:50:00' }
];
```

# PASSO 11 — FILTRO (HTML)

## filtro-solicitacoes.html

```html
<div class="filtro-container">

  <select #select class="filtro-select" (change)="selecionar(select.value)">
    <option value="">Todos</option>
    <option value="pendente">Pendente</option>
    <option value="aprovado">Aprovado</option>
    <option value="recusado">Recusado</option>
  </select>

</div>
```

```scss

:host {
  display: block; // Garante que o componente ocupe largura total
  width: 100%;
}

.filtro-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;

  button {
    all: unset; // Reseta o botão padrão do navegador
    padding: 8px 20px;
    border-radius: 50px;
    background: white;
    border: 1px solid #dee2e6;
    color: #495057;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      background: #1a237e;
      color: white;
      border-color: #1a237e;
      box-shadow: 0 4px 6px rgba(26, 35, 126, 0.2);
    }
  }
}
```

---

# PASSO 12 — CRIAR COMPONENTE DE BUSCA

```bash
ng generate component components/solicitacoes/busca-solicitacoes
```

---

# PASSO 13 — BUSCA (TS)

##  busca-solicitacoes.ts

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-busca-solicitacoes',
  standalone: true,
  templateUrl: './busca-solicitacoes.html'
})
export class BuscaSolicitacoesComponent {

  @Output() buscaChange = new EventEmitter<string>();

  onChange(event: any) {
    this.buscaChange.emit(event.target.value);
  }
}

```

---

# PASSO 14 — BUSCA (HTML)

## 📁 busca-solicitacoes.html

```html
<input type="text" (input)="onChange($event)" placeholder="Buscar cliente" />
```

---

# PASSO 15 — CRIAR COMPONENTE DE RESUMO

```bash
ng generate component components/solicitacoes/resumo-solicitacoes
```

---

# PASSO 16 — RESUMO (TS)

## 📁 resumo-solicitacoes.ts

```ts
import { Component, computed, input } from '@angular/core'; // Importe o 'input'
import { SolicitacaoViewModel } from '../../../services/graphql.service';

@Component({
  selector: 'app-resumo-solicitacoes',
  standalone: true,
  templateUrl: './resumo-solicitacoes.html'
})
export class ResumoSolicitacoesComponent {
  // Transforma em Signal Input
  lista = input<SolicitacaoViewModel[]>([]); 

  resumo = computed(() => {
    const dados = this.lista(); 

    return {
      total: dados.length,
      aprovadas: dados.filter(i => i.status === 'aprovado').length,
      pendentes: dados.filter(i => i.status === 'pendente').length,
      recusadas: dados.filter(i => i.status === 'recusado').length
    };
  });
}
```

---

# PASSO 17 — RESUMO (HTML)

## 📁 resumo-solicitacoes.html

```html
<div>
  Total: {{ resumo().total }} |
  Aprovadas: {{ resumo().aprovadas }} |
  Pendentes: {{ resumo().pendentes }} |
  Recusadas: {{ resumo().recusadas }}
</div>
```

---

# PASSO 18 — INTEGRAR NA LISTA

##  solicitacao-lista.html

```html
<div class="page-container">

  <app-header title="Solicitações de Crédito"></app-header>

  <div class="top-bar">

    <app-resumo-solicitacoes 
      [lista]="listaFiltrada()">
    </app-resumo-solicitacoes>

    <div class="acoes">
      <app-busca-solicitacoes 
        (buscaChange)="aplicarBusca($event)">
      </app-busca-solicitacoes>

      <app-filtro-solicitacoes 
        (filtroChange)="aplicarFiltro($event)">
      </app-filtro-solicitacoes>
    </div>
  </div>

  @if (service.loading()) {
    <p>Carregando...</p>
  } @else {

    <cdk-virtual-scroll-viewport itemSize="220" class="viewport">
      <!-- <div *cdkVirtualFor="let item of listaFiltrada(); trackBy: trackById"> -->
      <div *ngFor="let item of listaFiltrada(); trackBy: trackById">
        <app-solicitacao-item [solicitacao]="item"></app-solicitacao-item>
      </div>

    </cdk-virtual-scroll-viewport>

  }

</div>
```

---

# PASSO 19 — LÓGICA NA LISTA

##  solicitacao-lista.ts

```ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SolicitacoesService, SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { HeaderComponent } from '../../shared/header/header';
import { FiltroSolicitacoesComponent } from '../filtro-solicitacoes/filtro-solicitacoes';
import { ResumoSolicitacoesComponent } from '../resumo-solicitacoes/resumo-solicitacoes';
import { BuscaSolicitacoesComponent } from '../busca-solicitacoes/busca-solicitacoes';

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

  constructor(public service: SolicitacoesService) {}

  filtroSelecionado = signal<string>('');
  termoBusca = signal<string>('');

  ngOnInit() {
    if (this.service.solicitacoes().length === 0) {
      this.service.carregarSolicitacoes();
    }
  }

  aplicarFiltro(status: string) {
    this.filtroSelecionado.set(status);
  }

  aplicarBusca(termo: string) {
    this.termoBusca.set(termo.toLowerCase());
  }

  listaFiltrada = computed(() => {
    let lista = this.service.solicitacoes();

    const filtro = this.filtroSelecionado();
    const busca = this.termoBusca();

    if (filtro) {
      lista = lista.filter(item => item.status === filtro);
    }

    if (busca) {
      lista = lista.filter(item =>
        item.cliente.toLowerCase().includes(busca)
      );
    }

    return lista;
  });

  trackById(index: number, item: SolicitacaoViewModel) {
    return item.id;
  }
}
```
---

# CONFIGURANDO PRETTIER + HUSKY + LINT-STAGED (PASSO A PASSO CORRETO E ATUAL)

## 1. INSTALAR DEPENDÊNCIAS
No terminal:
npm install --save-dev prettier husky lint-staged eslint

## 2. CRIAR CONFIG DO PRETTIER
Na raiz do projeto (mesmo nível do package.json), criar o arquivo:
.prettierrc

Conteúdo:
{
  "singleQuote": true,
  "printWidth": 100
}

## 3. CONFIGURAR lint-staged
No arquivo package.json, adicionar no mesmo nível de "scripts":
"lint-staged": {
  "*.{ts,html,scss}": [
    "eslint --fix",
    "prettier --write"
  ]
}

## 4. CONFIGURAR HUSKY (VERSÃO ATUAL)
No terminal:
npx husky init

Isso cria automaticamente:
- pasta .husky/
- arquivo .husky/pre-commit

## 5. AJUSTAR PRE-COMMIT
Abrir o arquivo .husky/pre-commit e deixar apenas:
npx lint-staged

## 6. GARANTIR SCRIPT DO HUSKY
No package.json, dentro de "scripts", garantir:
"prepare": "husky"
(se já existir, não precisa alterar)

## 7. TESTAR NA PRÁTICA
1. Alterar um arquivo .ts (fora do padrão), por exemplo:
const nome = "teste"
console.log( nome )

2. Rodar no terminal:
git add .
git commit -m "teste husky"

## 8. RESULTADO ESPERADO
Durante o commit:
- eslint corrige problemas automaticamente
- prettier formata o código
- se houver erro → commit é bloqueado

## RESUMO FINAL
Prettier → formata código
ESLint → valida código
Husky → executa antes do commit
lint-staged → conecta tudo

Agora o projeto garante padrão de código automaticamente antes de subir alterações.





