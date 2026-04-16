# AULA 1 — BASE DO PROJETO E REVISÃO DE FUNDAMENTOS

---

## PARTE 1 — TEORIA

---

### 1.1 — O projeto: Painel de Solicitações de Crédito

Ao longo de 12 aulas, vamos construir um **painel de solicitações de crédito** — sistema presente em praticamente todo banco, fintech e cooperativa de crédito.

Um analista de crédito precisa:
- Visualizar, filtrar e acompanhar solicitações
- Lidar com dados sensíveis e regras de negócio
- Trabalhar com volume, performance e segurança


A Aula 1 é a fundação. Sem uma base sólida, nada que vem depois se sustenta.

---

### 1.2 — Revisão: Componentes Angular

**Componente** é a unidade fundamental do Angular. Tudo que aparece na tela é um componente.

Cada componente é composto de:
- **Template** (HTML) — o que o usuário vê
- **Classe TypeScript** — lógica, dados e métodos
- **Estilo** (SCSS) — aparência visual

O decorator `@Component` conecta tudo:

```typescript
@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [],
  templateUrl: './exemplo.html',
  styleUrl: './exemplo.scss'
})
export class ExemploComponent { }
```

Propriedades do decorator:
- `selector` — nome da tag HTML customizada (`<app-exemplo />`)
- `imports` — lista tudo que o componente usa (outros componentes, módulos)
- `templateUrl` / `styleUrl` — apontam para os arquivos de HTML e SCSS

**Standalone Components** — desde o Angular 19, é o padrão. Cada componente declara diretamente o que precisa nos `imports`, sem necessidade de módulos. Menos boilerplate, imports explícitos, melhor tree-shaking.

**Ciclo de vida** — o Angular gerencia a criação e destruição dos componentes. O hook mais importante agora é o `ngOnInit`: é o lugar certo para inicializar dados (não no constructor, porque nesse ponto os `@Input()` ainda não foram definidos).

---

### 1.3 — Revisão: Data Binding

O Angular tem 4 formas de binding — como os dados fluem entre TypeScript e HTML:

**1. Interpolação** `{{ }}`
Exibe valores no template.
```html
{{ cliente.nome }}
```

**2. Property Binding** `[ ]`
Passa valores do TypeScript para propriedades de elementos HTML.
```html
<button [disabled]="!formularioValido">Enviar</button>
```

**3. Event Binding** `( )`
Escuta eventos do DOM e executa métodos.
```html
<button (click)="selecionarSolicitacao(item)">Ver</button>
```

**4. Two-Way Binding** `[( )]`
Combina property + event binding (ida e volta).
```html
<input [(ngModel)]="filtro" />
```

**Comunicação entre componentes:**
- `@Input()` — o pai passa dados para o filho (dado desce ↓)
- `@Output()` + `EventEmitter` — o filho notifica o pai (evento sobe ↑)

```
[Lista]  ──@Input()──▶  [Item]     (dado desce)
[Lista]  ◀──@Output()──  [Item]     (evento sobe)
```

No projeto, usaremos `@Input()` para passar cada solicitação do componente Lista para o componente Item.

---

### 1.4 — Revisão: Diretivas e Pipes

**Diretivas Estruturais** — alteram a estrutura do DOM.

`@for` — itera sobre listas (substituto moderno do `*ngFor`):
```html
@for (item of solicitacoes; track item.id) {
  <app-solicitacao-item [solicitacao]="item" />
}
```

`@if` — renderização condicional (substituto moderno do `*ngIf`):
```html
@if (isLoading) {
  <app-loading />
} @else {
  <app-solicitacao-lista [solicitacoes]="dados" />
}
```

O Angular migrou de `*ngFor`/`*ngIf` para `@for`/`@if` por: melhor performance, type-checking e menos imports.

**Track no `@for`** — obrigatório. Diz ao Angular qual propriedade identifica cada item, evitando re-renderizações desnecessárias.

**Pipes** — transformadores de dados no template:

| Pipe | Função | Exemplo |
|------|--------|---------|
| `date` | Formata datas | `{{ data \| date:'dd/MM/yyyy' }}` |
| `currency` | Formata valores monetários | `{{ valor \| currency:'BRL' }}` |
| `uppercase` | Texto em maiúsculas | `{{ nome \| uppercase }}` |
| `titlecase` | Primeira letra maiúscula | `{{ nome \| titlecase }}` |

Pipes mantêm a lógica de apresentação no template, sem poluir o componente.

---

### 1.5 — Componentização inteligente

Componentizar não é só organizar pastas. É uma **decisão de arquitetura** que define fronteiras de responsabilidade.

**Por que componentizar?**
- **Reutilização** — usar o mesmo componente em vários lugares
- **Testabilidade** — componentes pequenos são mais fáceis de testar
- **Manutenibilidade** — mudanças isoladas, sem efeitos colaterais
- **Performance** — re-render apenas do que mudou

**Quando quebrar em componente?**
- Tem **responsabilidade própria** → vira componente
- Será **reutilizado** → vira componente
- Template passou de **50 linhas** → hora de quebrar

**Padrão Lista + Item** — extremamente comum em aplicações reais:

```
AppComponent
  └── SolicitacaoListaComponent (recebe Solicitacao[])
        ├── SolicitacaoItemComponent (recebe Solicitacao)
        ├── SolicitacaoItemComponent (recebe Solicitacao)
        └── SolicitacaoItemComponent (recebe Solicitacao)
```

- **Lista** — orquestra: itera, controla loading, filtra
- **Item** — apresenta: exibe UM card com os dados

**Modelagem de dados com Interface TypeScript** — definir o contrato dos dados antes de criar os componentes:

```typescript
export interface Solicitacao {
  id: number;
  cliente: string;
  documento: string;
  valor: number;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'recusado';
  dataSolicitacao: string;
}
```

Union types no `status` garantem segurança em tempo de compilação — o TypeScript rejeita valores inválidos. Nunca use `any` — é perder toda a proteção que o TypeScript oferece.

---

### 1.6 — Dados mock e simulação de loading

**Dados mock** — dados simulados que imitam o retorno da API.

Na vida real, o backend nem sempre está pronto quando o frontend começa. Mocks permitem desenvolver a UI de forma independente.

Boas práticas:
- Usar dados **realistas** (nomes reais, valores plausíveis, documentos formatados)
- Manter a **mesma estrutura** que a API retornará
- Separar os mocks em **arquivo dedicado** (não inline no componente)

Na Aula 2, vamos substituir os mocks por chamadas HTTP reais — a transição deve ser suave.

**Simulação de loading** — toda aplicação real tem latência. Simular desde o início:

```typescript
isLoading = true;

ngOnInit() {
  setTimeout(() => {
    this.solicitacoes = MOCK_SOLICITACOES;
    this.isLoading = false;
  }, 1500);
}
```

Na Aula 2, o `setTimeout` será substituído pelo Observable do `HttpClient`.

**Estados da tela** — toda tela profissional deve tratar:

| Estado | Descrição |
|--------|-----------|
| **Loading** | Dados carregando, exibe feedback visual |
| **Success** | Dados carregados, exibe conteúdo |
| **Empty** | Lista vazia, mensagem amigável |
| **Error** | Falha na API (Aula 2) |

---

## INTERVALO (15 minutos)

---

## PARTE 2 — PRÁTICA

---

### 2.1 — Criar o projeto Angular

**Pré-requisitos:**
```bash
node -v    # >= 18
npm -v     # >= 9
ng version # >= 19 (se não tiver: npm install -g @angular/cli)
```

**Criar o projeto:**
```bash
ng new painel-credito --style=scss --routing=true --ssr=false
```

| Flag | Motivo |
|------|--------|
| `--style=scss` | Pré-processador CSS com variáveis, nesting e mais |
| `--routing=true` | Cria arquivo de rotas (vamos precisar na Aula 2) |
| `--ssr=false` | Sem server-side rendering (simplifica o setup) |

O CLI vai fazer algumas perguntas:
- **Share pseudonymous usage data?** → N
- **Do you want to create a 'zoneless' application?** → **N** (manter zone.js — zoneless exige Signals pra tudo, veremos isso gradualmente)

**Rodar o projeto:**
```bash
cd painel-credito
ng serve
```

Acessar `http://localhost:4200` — limpar o conteúdo de `app.html` (remover o boilerplate do Angular).

---

### 2.2 — Estrutura de pastas

```
src/app/
├── models/                          ← interfaces e tipos
│   └── solicitacao.model.ts
├── mocks/                           ← dados simulados (temporário)
│   └── solicitacoes.mock.ts
├── components/                      ← componentes por feature
│   └── solicitacoes/
│       ├── solicitacao-lista/
│       │   ├── solicitacao-lista.ts
│       │   ├── solicitacao-lista.html
│       │   └── solicitacao-lista.scss
│       └── solicitacao-item/
│           ├── solicitacao-item.ts
│           ├── solicitacao-item.html
│           └── solicitacao-item.scss
├── app.ts
├── app.html
├── app.scss
└── app.routes.ts
```

Na Aula 6 vamos refatorar para uma estrutura feature-based completa. Por enquanto, essa organização é suficiente.

---

### 2.3 — Criar a interface Solicitacao

**Arquivo:** `src/app/models/solicitacao.model.ts`

```typescript
export type StatusSolicitacao = 'pendente' | 'em_analise' | 'aprovado' | 'recusado';

export interface Solicitacao {
  id: number;
  cliente: string;
  documento: string;
  valor: number;
  status: StatusSolicitacao;
  dataSolicitacao: string;
}
```

- `type` separado para o status → reutilizável em filtros, serviços, pipes
- Union type garante que apenas valores válidos são aceitos
- `documento` genérico — pode ser CPF ou CNPJ
- `dataSolicitacao` como string ISO — na Aula 2 discutiremos `Date` vs `string`

---

### 2.4 — Criar os dados mock

**Arquivo:** `src/app/mocks/solicitacoes.mock.ts`

```typescript
import { Solicitacao } from '../models/solicitacao.model';

export const MOCK_SOLICITACOES: Solicitacao[] = [
  {
    id: 1,
    cliente: 'Maria Silva',
    documento: '123.456.789-00',
    valor: 50000,
    status: 'pendente',
    dataSolicitacao: '2025-03-15T10:30:00'
  },
  {
    id: 2,
    cliente: 'João Santos',
    documento: '987.654.321-00',
    valor: 120000,
    status: 'aprovado',
    dataSolicitacao: '2025-03-10T14:00:00'
  },
  {
    id: 3,
    cliente: 'Tech Solutions Ltda',
    documento: '12.345.678/0001-90',
    valor: 500000,
    status: 'em_analise',
    dataSolicitacao: '2025-03-20T09:15:00'
  },
  {
    id: 4,
    cliente: 'Ana Oliveira',
    documento: '456.789.123-00',
    valor: 25000,
    status: 'recusado',
    dataSolicitacao: '2025-03-08T16:45:00'
  },
  {
    id: 5,
    cliente: 'Global Imports S.A.',
    documento: '98.765.432/0001-10',
    valor: 1000000,
    status: 'pendente',
    dataSolicitacao: '2025-03-22T11:00:00'
  }
];
```

Dados variados de propósito: pessoas físicas e jurídicas, todos os status representados, valores de 25 mil a 1 milhão, datas diferentes.

---

### 2.5 — Componente SolicitacaoItem

```bash
ng generate component components/solicitacoes/solicitacao-item
```

**`solicitacao-item.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-solicitacao-item',
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrl: './solicitacao-item.scss'
})
export class SolicitacaoItemComponent {
  @Input({ required: true }) solicitacao!: Solicitacao;

  get statusClass(): string {
    const classMap: Record<string, string> = {
      pendente: 'status--pendente',
      em_analise: 'status--analise',
      aprovado: 'status--aprovado',
      recusado: 'status--recusado'
    };
    return classMap[this.solicitacao.status] ?? '';
  }

  get statusLabel(): string {
    const labelMap: Record<string, string> = {
      pendente: 'Pendente',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      recusado: 'Recusado'
    };
    return labelMap[this.solicitacao.status] ?? this.solicitacao.status;
  }
}
```

- `@Input({ required: true })` — o componente pai é obrigado a passar esse dado
- Getters derivam a classe CSS e o label legível a partir do status
- `Record<string, string>` tipa o mapa de chave/valor

**`solicitacao-item.html`**

```html
<div class="card">
  <div class="card__header">
    <h3 class="card__cliente">{{ solicitacao.cliente }}</h3>
    <span class="card__status" [class]="statusClass">
      {{ statusLabel }}
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
        {{ solicitacao.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
      </span>
    </div>

    <div class="card__info">
      <span class="card__label">Data da Solicitação</span>
      <span class="card__value">
        {{ solicitacao.dataSolicitacao | date:'dd/MM/yyyy' }}
      </span>
    </div>
  </div>
</div>
```

- Interpolação `{{ }}` para exibir dados
- Property binding `[class]` para classe CSS dinâmica
- Pipe `currency` formata em R$ com padrão brasileiro
- Pipe `date` formata para dd/MM/yyyy

**`solicitacao-item.scss`**

```scss
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  border: 1px solid #e8e8e8;

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
}

.status {
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

Estilos com convenção **BEM** (Block\_\_Element--Modifier), cores semânticas por status e hover com elevação sutil.

---

### 2.6 — Componente SolicitacaoLista

```bash
ng generate component components/solicitacoes/solicitacao-lista
```

**`solicitacao-lista.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitacao } from '../../../models/solicitacao.model';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { MOCK_SOLICITACOES } from '../../../mocks/solicitacoes.mock';

@Component({
  selector: 'app-solicitacao-lista',
  imports: [CommonModule, SolicitacaoItemComponent],
  templateUrl: './solicitacao-lista.html',
  styleUrl: './solicitacao-lista.scss'
})
export class SolicitacaoListaComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  isLoading = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.solicitacoes = MOCK_SOLICITACOES;
      this.isLoading = false;
    }, 1500);
  }
}
```

- `implements OnInit` — hook de ciclo de vida para inicialização
- `isLoading = true` — tela começa em estado de loading
- `setTimeout` simula latência de API — na Aula 2 vira chamada HTTP real

**`solicitacao-lista.html`**

```html
@if (isLoading) {
  <div class="loading">
    <div class="loading__spinner"></div>
    <p class="loading__text">Carregando solicitações...</p>
  </div>
} @else {
  @if (solicitacoes.length === 0) {
    <div class="empty">
      <p class="empty__text">Nenhuma solicitação encontrada.</p>
    </div>
  } @else {
    <div class="lista">
      @for (solicitacao of solicitacoes; track solicitacao.id) {
        <app-solicitacao-item [solicitacao]="solicitacao" />
      }
    </div>
  }
}
```

Três estados tratados: loading, lista vazia e lista com dados. O `track solicitacao.id` otimiza re-renders.

**`solicitacao-lista.scss`**

```scss
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__text {
    margin-top: 1rem;
    color: #6b7280;
    font-size: 0.95rem;
  }
}

.empty {
  text-align: center;
  padding: 4rem 0;

  &__text {
    color: #9ca3af;
    font-size: 1rem;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Grid responsivo com `auto-fill` + `minmax` (adapta automaticamente ao tamanho da tela). Spinner feito com CSS puro.

---

### 2.7 — Integrar no AppComponent

**`app.ts`**

```typescript
import { Component } from '@angular/core';
import { SolicitacaoListaComponent } from './components/solicitacoes/solicitacao-lista/solicitacao-lista';

@Component({
  selector: 'app-root',
  imports: [SolicitacaoListaComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'Painel de Solicitações de Crédito';
}
```

**`app.html`**

```html
<header class="header">
  <div class="header__container">
    <h1 class="header__title">{{ title }}</h1>
    <p class="header__subtitle">Gerencie e acompanhe as solicitações de crédito</p>
  </div>
</header>

<main class="main">
  <div class="main__container">
    <app-solicitacao-lista />
  </div>
</main>
```

**`app.scss`**

```scss
.header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  &__subtitle {
    font-size: 0.9rem;
    color: #94a3b8;
    margin: 0;
  }
}

.main {
  background-color: #f8fafc;
  min-height: calc(100vh - 100px);
  padding: 2rem 0;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
}
```

**`src/styles.scss`** (estilos globais)

```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  color: #1a1a2e;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### 2.8 — Refinamentos

**Testar o estado empty** — mudar temporariamente o mock para `[]` e verificar que a mensagem "Nenhuma solicitação encontrada" aparece.

**Configurar locale pt-BR** no `app.config.ts`:

```typescript
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localePt, 'pt-BR');
```

Adicionar nos providers:
```typescript
providers: [
  { provide: LOCALE_ID, useValue: 'pt-BR' }
]
```

Sem locale registrado, os pipes usam en-US por padrão (`$50,000.00` em vez de `R$ 50.000,00`).

**Inspecionar no DevTools** — abrir a aba Elements e observar as tags customizadas `<app-solicitacao-lista>` e `<app-solicitacao-item>` na árvore do DOM. Os estilos de cada componente são encapsulados automaticamente.

---

### 2.9 — Recapitulação

**O que construímos:**
- Projeto Angular do zero
- Interface tipada `Solicitacao` com union types
- Dados mock realistas (PF e PJ)
- Componente Item — card individual com formatação profissional
- Componente Lista — orquestrador com loading, empty e iteração
- Integração no AppComponent com header e layout
- Locale pt-BR para formatação brasileira

**Conceitos aplicados:**
- Componentes standalone
- `@Input()` para comunicação pai → filho
- Property binding e interpolação
- `@for` com `track` e `@if` / `@else`
- Pipes (`currency`, `date`)
- BEM (CSS) e CSS Grid

**Preview da Aula 2:**
- Substituir mocks por chamadas HTTP reais (`HttpClient`)
- Criar Service com tipagem
- API mock com `json-server`
- Signals para gerenciamento de estado
- Lazy Loading com rotas
- Tratamento do estado de erro

---

### Desafio para casa 

1. Adicionar mais 3 solicitações ao mock com status variados
2. Criar um getter no componente lista que conta solicitações por status
3. Exibir um resumo acima da lista:
   > "5 solicitações | 2 pendentes | 1 em análise | 1 aprovado | 1 recusado"

---

## Pré-requisitos

- [ ] Node.js >= 18
- [ ] npm >= 9
- [ ] Angular CLI >= 19 (`npm install -g @angular/cli`)
- [ ] VS Code com extensão **Angular Language Service**
