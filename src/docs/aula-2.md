## 1. O QUE ESTAMOS CONSTRUINDO

- Estamos construindo um sistema que:
  - consome dados
  - reage a estados
  - evolui ao longo do tempo

---

- Um frontend real precisa lidar com:
  - dados externos (API)
  - tempo de resposta (latência)
  - erros
  - mudanças constantes

---

- O objetivo não é “fazer funcionar”
- O objetivo é “fazer funcionar de forma sustentável”

---

## 2. O ERRO MAIS COMUM EM FRONTEND

- Colocar tudo dentro do componente

---

- O componente começa a fazer:
  - buscar dados
  - tratar erro
  - transformar dados
  - renderizar UI

---

- Resultado:
  - código difícil de entender
  - difícil de testar
  - difícil de manter
  - qualquer mudança quebra tudo

---

- Problema não é Angular
- Problema é falta de arquitetura

---

## 3. SEPARAÇÃO DE RESPONSABILIDADE

- Cada parte da aplicação deve ter uma responsabilidade clara

---

- Divisão principal:

  - Componente → interface
  - Service → dados e regras

---

- Componente:
  - exibe dados
  - reage a eventos
  - chama ações

---

- Service:
  - busca dados
  - controla estado
  - trata erro
  - transforma dados

---

- Regra principal:

  - O componente NÃO sabe de onde vem o dado

---

## 4. ESTADO DE REQUISIÇÃO

- Toda aplicação que consome API tem estado

---

- Estados principais:

  - loading
  - error
  - success

---

- loading:
  - indica que algo está acontecendo
  - evita sensação de travamento

---

- error:
  - informa falha
  - evita silêncio da aplicação

---

- success:
  - exibe dados corretamente

---

- Sem controle de estado:
  - tela vazia
  - comportamento confuso
  - experiência ruim

---

## 5. FLUXO DE DADOS EM UMA APLICAÇÃO

- O frontend não cria dados
- O frontend consome dados

---

- Fluxo real:

  - usuário acessa a tela
  - frontend faz requisição
  - backend responde
  - frontend renderiza

---

- Esse processo não é instantâneo

---

- Por isso precisamos:
  - loading
  - tratamento de erro
  - controle de fluxo

---

## 6. MOCK VS API REAL

- Mock:
  - dados fixos
  - rápidos para desenvolvimento
  - independência do backend

---

- Problemas do mock:
  - não simula rede
  - não simula erro real
  - não representa produção

---

- Evolução natural:

  - mock → API fake → backend real

---

- Mock é ferramenta de desenvolvimento
- Não é solução final

---

## 7. TRANSFORMAÇÃO DE DADOS

- Backend não entrega dados prontos para UI

---

- Exemplo de dado bruto: `status: "pendente"`

---

- O que a UI precisa:

  - texto formatado
  - classe CSS
  - informação pronta para exibição

---

- Problema:

  - se a UI fizer essa transformação:
    - lógica espalhada
    - difícil manutenção

---

- Solução:

  - criar um ViewModel

---

- Model:
  - dado bruto da API

---

- ViewModel:
  - dado preparado para UI

---

- Benefícios:
  - remove lógica do template
  - centraliza regras
  - facilita manutenção

---

## 8. ACOPLAMENTO

- Acoplamento = dependência direta entre partes

---

- Exemplo ruim:

  - componente conhece:
    - API
    - estrutura da resposta
    - regras de negócio

---

- Consequência:
  - qualquer mudança quebra tudo

---

- Solução:

  - desacoplar responsabilidades

---

- Resultado:

  - componente não conhece API
  - conhece apenas o service

---

## 9. HTTP E REALIDADE DE PRODUÇÃO

- Requisições reais envolvem:

  - tempo de resposta
  - falhas
  - dados externos

---

- Diferente do mock: `setTimeout(...)`

---

- Com HTTP real: `this.http.get(...)`

---

- Impactos:

  - necessidade de loading
  - necessidade de tratar erro
  - necessidade de controlar fluxo

---

## 10. REST VS GRAPHQL

- REST:
  - endpoints fixos
  - backend define estrutura

---

- GraphQL:
  - cliente escolhe dados
  - mais flexível

---

- Diferença principal:

  - REST → servidor decide
  - GraphQL → cliente decide

---

- Nenhum é melhor sempre
- Depende do contexto

---

## 11. ARQUITETURA FINAL

- Aplicação bem estruturada tem:

  - componente → UI
  - service → lógica e dados
  - API → fonte de dados

---

- Fluxo completo:

  - componente inicia
  - chama service
  - service busca dados
  - service transforma dados
  - componente renderiza

---

- Resultado:

  - código organizado
  - fácil manutenção
  - escalável

---

## 12. FECHAMENTO

- Não estamos aprendendo só Angular

---

- Estamos aprendendo:

  - como organizar aplicações
  - como separar responsabilidades
  - como construir sistemas reais

---

- Isso permite:

  - trabalhar em projetos grandes
  - evoluir código sem quebrar
  - entender qualquer stack

---

- Regra final:

  - quem entende arquitetura
  - não depende de ferramenta

# AULA 2 — API DESIGN, REST, GRAPHQL E ESTADO DE REQUISIÇÃO (PRÁTICA)

## VISÃO GERAL
Ordem correta para não quebrar o projeto durante a aula:

1. Criar service
2. Implementar estados (loading, error, success)
3. Conectar service ao componente
4. Atualizar template
5. Subir json-server
6. Migrar para HttpClient
7. Subir backend separado
8. Lazy loading
9. Comparação REST vs GraphQL

---

# ETAPA 1 — CRIAR SERVICE (BASE DA ARQUITETURA)


## Arquivo: src/app/services/solicitacoes.service.ts

```ts
import { Injectable, signal } from '@angular/core';
import { Solicitacao } from '../models/solicitacao.model';
import { MOCK_SOLICITACOES } from '../mocks/solicitacoes.mock';

export interface SolicitacaoViewModel extends Solicitacao {
  statusClass: string;
  statusLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitacoesService {

  solicitacoes = signal<SolicitacaoViewModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  carregarSolicitacoes() {
    this.loading.set(true);
    this.error.set(null);

    setTimeout(() => {
      try {
        const data = MOCK_SOLICITACOES.map(s => this.mapToViewModel(s));
        this.solicitacoes.set(data);
      } catch {
        this.error.set('Erro ao carregar dados');
      } finally {
        this.loading.set(false);
      }
    }, 1000);
  }

  private mapToViewModel(s: Solicitacao): SolicitacaoViewModel {
    const status = s.status.toLowerCase();

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
```

---

# ETAPA 2 — CONECTAR SERVICE AO COMPONENTE

## Arquivo: solicitacao-lista.ts

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacoesService } from '../../../services/solicitacoes.service';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent],
  templateUrl: './solicitacao-lista.html',
  styleUrl: './solicitacao-lista.scss'
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  ngOnInit() {
    this.service.carregarSolicitacoes();
  }
}
```

---

# ETAPA 3 — TEMPLATE DA LISTA

## Arquivo: solicitacao-lista.html

```html
<h2>Solicitações</h2>

@if (service.loading()) {
  <p>Carregando...</p>
}

@if (service.error()) {
  <p>{{ service.error() }}</p>
}

@if (!service.loading() && !service.error()) {
  <div class="lista">
    @for (item of service.solicitacoes(); track item.id) {
      <app-solicitacao-item [solicitacao]="item"></app-solicitacao-item>
    }
  </div>
}
```

---

# ETAPA 4 — COMPONENTE ITEM

## Arquivo: solicitacao-item.ts

```ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoViewModel } from '../../../services/solicitacoes.service';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss']
})
export class SolicitacaoItemComponent {

  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;

}
```

---

# ETAPA 5 — TEMPLATE ITEM

## Arquivo: solicitacao-item.html

```html
<div class="card">
  <div class="header">
    <h3>{{ solicitacao.cliente }}</h3>

    <span class="status" [ngClass]="solicitacao.statusClass">
      {{ solicitacao.statusLabel }}
    </span>
  </div>

  <div class="content">
    <div class="col">
      <span>Documento</span>
      <span>Valor Solicitado</span>
      <span>Data da Solicitação</span>
    </div>

    <div class="col right">
      <span>{{ solicitacao.documento }}</span>

      <span class="valor">
        {{ solicitacao.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
      </span>

      <span>
        {{ solicitacao.dataSolicitacao | date:'dd/MM/yyyy' }}
      </span>
    </div>
  </div>
</div>
```

---

# ETAPA 6 — SCSS

## Arquivo: solicitacao-item.scss

```scss
.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;

  &.card__status--pendente {
    background-color: #fff3e0;
    color: #ef6c00;
  }

  &.card__status--analise {
    background-color: #e3f2fd;
    color: #1565c0;
  }

  &.card__status--aprovado {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  &.card__status--recusado {
    background-color: #ffeeee;
    color: #c62828;
  }
}
```

# AULA 2 — PARTE 2  
## API FAKE (SERVICE) → API FAKE (HTTP)

---

# ETAPA 1 — SUBIR API FAKE (JSON SERVER)

## Arquivo: db.json (na raiz do projeto)

```json
{
  "solicitacoes": [
    {
      "id": 1,
      "cliente": "Maria Silva",
      "documento": "123.456.789-00",
      "valor": 5000,
      "status": "pendente",
      "dataSolicitacao": "2026-04-01T10:00:00"
    },
    {
      "id": 2,
      "cliente": "João Souza",
      "documento": "987.654.321-00",
      "valor": 12000,
      "status": "aprovado",
      "dataSolicitacao": "2026-04-02T14:00:00"
    }
  ]
}
```

## Instalar

```bash
npm install json-server
```

## Rodar

```bash
npx json-server --watch db.json --port 3000
```

---

# ETAPA 2 — MIGRAR SERVICE PARA HTTPCLIENT

## Arquivo: src/app/services/solicitacoes.service.ts

```ts
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
```

---

# ETAPA 3 — CONFIGURAR HTTPCLIENT

## Arquivo: src/app/app.config.ts

```ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient()
  ]
};
```

---

# RESULTADO

- dados continuam vindo de uma API fake  
- agora via HTTP  
- service continua responsável pela transformação  
- componente não muda  
---

Subir projeto na branch aula2-api-fake

# AULA 2 — PARTE 3  
## BACKEND REAL + ARQUITETURA

---

# ETAPA 1 — CRIAR BACKEND REAL

## Estrutura

Criar fora do projeto Angular:

```bash
mkdir backend
cd backend
```

---

# ETAPA 2 — INICIALIZAR PROJETO NODE

Dentro da pasta `backend`:

```bash
npm init -y
npm install express cors
```

---

# ETAPA 3 — CRIAR SERVIDOR

## Arquivo: backend/server.js

```js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let solicitacoes = [
  {
    id: 1,
    cliente: 'Backend Real',
    documento: '000.000.000-00',
    valor: 9000,
    status: 'pendente',
    dataSolicitacao: '2026-04-01T10:00:00'
  }
];

app.get('/solicitacoes', (req, res) => {
  res.json(solicitacoes);
});

app.post('/solicitacoes', (req, res) => {
  const nova = { id: Date.now(), ...req.body };
  solicitacoes.push(nova);
  res.status(201).json(nova);
});

app.put('/solicitacoes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = solicitacoes.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Não encontrada' });
  }

  solicitacoes[index] = req.body;

  res.json(solicitacoes[index]);
});

app.listen(3001, () => {
  console.log('API rodando em http://localhost:3001');
});
```

---

# ETAPA 4 — RODAR BACKEND

No terminal:

```bash
cd backend
node server.js
```

---

# ETAPA 5 — AJUSTAR SERVICE (FRONTEND)

## Arquivo: src/app/services/solicitacoes.service.ts

```ts
private API_URL = 'http://localhost:3001/solicitacoes';
```

---

# ETAPA 6 — TESTAR INTEGRAÇÃO

Abrir no navegador:

```
http://localhost:3001/solicitacoes
```

Rodar Angular normalmente:

```bash
ng serve
```
# POSTMAN

# EXEMPLOS DE VERBOS HTTP (POSTMAN)

## BASE URL

http://localhost:3001/solicitacoes

---

# GET — BUSCAR DADOS

## Listar todas as solicitações

GET http://localhost:3001/solicitacoes


---

## Buscar por ID (opcional)

GET http://localhost:3001/solicitacoes/1

---

# POST — CRIAR DADO

## Criar nova solicitação

POST http://localhost:3001/solicitacoes

### Body (JSON)

{
  "cliente": "Empresa XPTO",
  "documento": "12.345.678-90",
  "valor": 20000,
  "status": "pendente",
  "dataSolicitacao": "2026-04-10T10:00:00"
}


---

# PUT — ATUALIZAR COMPLETO

## Atualizar toda a solicitação

PUT http://localhost:3001/solicitacoes/1

### Body (JSON)

{
  "id": 1,
  "cliente": "Empresa Atualizada",
  "documento": "12.345.678-90",
  "valor": 30000,
  "status": "aprovado",
  "dataSolicitacao": "2026-04-10T10:00:00"
}


---

# PATCH — ATUALIZAÇÃO PARCIAL

## Atualizar só o status

PATCH http://localhost:3001/solicitacoes/1

### Body (JSON)

{
  "status": "aprovado"
}


---

# DELETE — REMOVER

## Remover solicitação

DELETE http://localhost:3001/solicitacoes/1


---

# RESUMO 

GET → buscar  
POST → criar  
PUT → substituir tudo  
PATCH → atualizar parte  
DELETE → remover  

---



# ETAPA 7 — LAZY LOADING (FRONTEND)

## Arquivo: src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent)
  }
];
```

Subir aplicaçao branch - aula2

---

# RESULTADO

- frontend e backend separados  
- API própria rodando  
- integração real via HTTP  
- estrutura próxima de projeto de mercado  

______

# ETAPA 4 — GRAPHQL + APOLLO (MANTENDO ARQUITETURA)
retornar para branch sem http

---

# PASSO 1 — INSTALAR DEPENDÊNCIAS (BACKEND)

Dentro da pasta `backend`:

```bash
npm install express graphql express-graphql cors --legacy-peer-deps
```

---

# PASSO 2 — CRIAR BACKEND GRAPHQL

## 📁 backend/server-graphql.js

```js
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(cors());

let solicitacoes = [
  {
    id: 1,
    cliente: 'Sheldon Cooper',
    documento: '111.222.333-44',
    valor: 25000,
    status: 'aprovado',
    dataSolicitacao: '2026-04-03T09:15:00'
  },
  {
    id: 2,
    cliente: 'Rachel Green',
    documento: '555.666.777-88',
    valor: 8500,
    status: 'pendente',
    dataSolicitacao: '2026-04-05T16:30:00'
  },
  {
    id: 3,
    cliente: 'Barney Stinson',
    documento: '000.000.001-01',
    valor: 99999,
    status: 'aprovado',
    dataSolicitacao: '2026-04-06T22:00:00'
  },
  {
    id: 4,
    cliente: 'Penny Hofstadter',
    documento: '444.555.666-77',
    valor: 1200,
    status: 'reprovado',
    dataSolicitacao: '2026-04-07T11:20:00'
  },
  {
    id: 5,
    cliente: 'Chandler Bing',
    documento: '222.333.444-55',
    valor: 15000,
    status: 'aprovado',
    dataSolicitacao: '2026-04-08T13:45:00'
  },
  {
    id: 6,
    cliente: 'Robin Scherbatsky',
    documento: '888.777.666-55',
    valor: 7200,
    status: 'pendente',
    dataSolicitacao: '2026-04-09T10:10:00'
  },
  {
    id: 7,
    cliente: 'Joey Tribbiani',
    documento: '333.222.111-00',
    valor: 450,
    status: 'reprovado',
    dataSolicitacao: '2026-04-10T15:00:00'
  },
  {
    id: 8,
    cliente: 'Ted Mosby',
    documento: '999.888.777-66',
    valor: 18000,
    status: 'pendente',
    dataSolicitacao: '2026-04-11T08:00:00'
  }
];

const schema = buildSchema(`
  type Solicitacao {
    id: ID
    cliente: String
    documento: String
    valor: Float
    status: String
    dataSolicitacao: String
  }

  type Query {
    solicitacoes: [Solicitacao]
  }

  type Mutation {
    criarSolicitacao(
      cliente: String
      documento: String
      valor: Float
      status: String
      dataSolicitacao: String
    ): Solicitacao

    atualizarStatus(
      id: ID
      status: String
    ): Solicitacao

    removerSolicitacao(
      id: ID
    ): Solicitacao
  }
`);

const root = {

  solicitacoes: () => solicitacoes,

  criarSolicitacao: ({ cliente, documento, valor, status, dataSolicitacao }) => {
    const nova = {
      id: Date.now().toString(),
      cliente,
      documento,
      valor,
      status,
      dataSolicitacao
    };

    solicitacoes.push(nova);
    return nova;
  },

  atualizarStatus: ({ id, status }) => {
    const item = solicitacoes.find(s => String(s.id) === String(id));

    if (!item) {
      throw new Error('Solicitação não encontrada');
    }

    item.status = status;
    return item;
  },

  removerSolicitacao: ({ id }) => {
    const index = solicitacoes.findIndex(s => String(s.id) === String(id));

    if (index === -1) {
      throw new Error('Solicitação não encontrada');
    }

    const removida = solicitacoes[index];
    solicitacoes.splice(index, 1);

    return removida;
  }
};

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000, () => {
  console.log('GraphQL rodando em http://localhost:4000/graphql');
});

```

---

# PASSO 3 — RODAR BACKEND

```bash
node server-graphql.js
```

---

# PASSO 4 — TESTAR NO PLAYGROUND

# EXEMPLOS — GRAPHQL

## QUERY — LISTAR TODAS AS SOLICITAÇÕES

```graphql
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
```

---

## QUERY — LISTAR COM MENOS CAMPOS

```graphql
query {
  solicitacoes {
    id
    cliente
    valor
  }
}
```

---

## QUERY — APENAS NOMES

```graphql
query {
  solicitacoes {
    cliente
  }
}
```

---

## QUERY — COM ALIAS

```graphql
query {
  lista: solicitacoes {
    cliente
  }
}
```

---

# MUTATIONS (EXEMPLOS)

---

## MUTATION — CRIAR SOLICITAÇÃO

```graphql
mutation {
  criarSolicitacao(
    cliente: "Empresa X"
    documento: "00.000.000/0001-00"
    valor: 15000
    status: "pendente"
    dataSolicitacao: "2026-04-10T10:00:00"
  ) {
    id
    cliente
    valor
  }
}
```

---

## MUTATION — ATUALIZAR STATUS

```graphql
mutation {
  atualizarStatus(
    id: 1
    status: "aprovado"
  ) {
    id
    status
  }
}
```

---

## MUTATION — REMOVER

```graphql
mutation {
  removerSolicitacao(id: 1) {
    id
  }
}
```

---

```

Abrir:

```
http://localhost:4000/graphql
```

Query:

```graphql
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
```

---

# PASSO 5 — INSTALAR APOLLO (FRONTEND)

```bash
npm install apollo-angular @apollo/client graphql
```

---

# PASSO 6 — CONFIGURAR APP (FRONTEND)

## 📁 src/app/app.config.ts

```ts
import { ApplicationConfig, inject, LOCALE_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),

    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    },

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://localhost:4000/graphql'
        }),
        cache: new InMemoryCache()
      };
    })
  ]
};
```

---

# PASSO 7 — SERVICE GRAPHQL

## 📁 src/app/services/graphql.service.ts

```ts
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
```

---

# PASSO 8 — COMPONENTE LISTA

## 📁 solicitacao-lista.ts

```ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { SolicitacoesService } from '../../../services/graphql.service';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  ngOnInit() {
    this.service.carregarSolicitacoes();
  }
}
```

---

## 📁 solicitacao-lista.html

```html
@if (service.loading()) {
  <p>Carregando...</p>
} @else {
  @if (service.solicitacoes().length === 0) {
    <p>Nenhuma solicitação encontrada.</p>
  } @else {
    <div class="lista">
      @for (solicitacao of service.solicitacoes(); track $index) {
        <app-solicitacao-item [solicitacao]="solicitacao" />
      }
    </div>
  }
}
```

---

# PASSO 9 — COMPONENTE ITEM

## 📁 solicitacao-item.ts

```ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoViewModel } from '../../../services/graphql.service';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss']
})
export class SolicitacaoItemComponent {
  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;
}
```

---

## 📁 solicitacao-item.html

```html
<div class="card">
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

---

## 📁 solicitacao-item.scss

```scss
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card__body {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.card__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card__label {
  font-size: 12px;
  color: #888;
}

.card__value {
  font-size: 14px;
}

.card__value--destaque {
  font-weight: bold;
}

.card__cliente {
  font-size: 16px;
  font-weight: 600;
}

/* 🔥 BASE DO STATUS */
.card__status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.card__status--pendente {
  background-color: #fff3e0;
  color: #ef6c00;
}

.card__status--analise {
  background-color: #e3f2fd;
  color: #1565c0;
}

.card__status--aprovado {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.card__status--recusado {
  background-color: #ffeeee;
  color: #c62828;
}
```

---

# RESULTADO FINAL

- GraphQL funcionando  
- Apollo configurado  
- Signals funcionando  
- Componentes desacoplados  
- CSS ajustado  
- Lista renderizando corretamente  


