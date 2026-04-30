# AULA 13 — Simulador de Crédito e Organização Feature First

---

# OBJETIVO DA AULA

Entregas :

1. Criar uma nova funcionalidade: Simulador de Crédito.
2. Reorganizar o projeto usando uma estrutura Feature First.

Passo a passo 

- criar uma tela nova de simulação de crédito;
- usar `signal` e `computed` para cálculos reativos;
- adicionar uma rota protegida para o simulador;
- adicionar o simulador no menu;
- reorganizar as pastas do projeto;
- separar melhor responsabilidades;
- deixar a arquitetura mais próxima de uma aplicação real.

---

# PARTE 1 — RECAPITULAÇÃO RÁPIDA

```txt
login com Firebase Authentication
login com Google
login com email e senha
rotas protegidas
perfil do usuário
tema claro e escuro
internacionalização
central de atividades
Firestore como backend das solicitações
feedback acessível
ajustes de acessibilidade
```

Agora vamos adicionar:

```txt
Simulador de Crédito
```

E depois reorganizar o projeto para:

```txt
Feature First
```

---

# PARTE 2 — O QUE VAMOS CONSTRUIR

O simulador terá os seguintes campos:

```txt
valor solicitado
prazo em meses
taxa de juros mensal
```

E vai calcular automaticamente:

```txt
valor aproximado da parcela
valor total pago
total de juros
```


---

# PARTE 3 — CRIAR A FEATURE DO SIMULADOR

Criar a estrutura:

```txt
src/app/features/simulador/components/simulador-credito/
```

Dentro dela, criar os arquivos:

```txt
simulador-credito.ts
simulador-credito.html
simulador-credito.scss
```

A estrutura ficará assim:

```txt
src/app/features/simulador/
  components/
    simulador-credito/
      simulador-credito.ts
      simulador-credito.html
      simulador-credito.scss
```

---

# PARTE 4 — CRIAR O COMPONENTE DO SIMULADOR

```
 ng g c components/simulador-credito   
```

## Arquivo

```txt
src/app/features/simulador/components/simulador-credito/simulador-credito.ts
```

## Conteúdo completo

```ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { HeaderComponent } from '../shared/header/header';

@Component({
  selector: 'app-simulador-credito',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, TranslatePipe, HeaderComponent],
  templateUrl: './simulador-credito.html',
  styleUrls: ['./simulador-credito.scss'],
})
export class SimuladorCreditoComponent {
  valorSolicitado = signal(10000);
  prazoMeses = signal(12);
  taxaJuros = signal(2);

  taxaDecimal = computed(() => this.taxaJuros() / 100);

  valorParcela = computed(() => {
    const valor = this.valorSolicitado();
    const prazo = this.prazoMeses();
    const taxa = this.taxaDecimal();

    if (prazo <= 0) {
      return 0;
    }

    if (taxa === 0) {
      return valor / prazo;
    }

    const fator = Math.pow(1 + taxa, prazo);

    return valor * ((taxa * fator) / (fator - 1));
  });

  valorTotalPago = computed(() => {
    return this.valorParcela() * this.prazoMeses();
  });

  totalJuros = computed(() => {
    return this.valorTotalPago() - this.valorSolicitado();
  });

  constructor(private router: Router) {}

  alterarValor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valorSolicitado.set(Number(input.value));
  }

  alterarPrazo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.prazoMeses.set(Number(input.value));
  }

  alterarTaxa(event: Event) {
    const input = event.target as HTMLInputElement;
    this.taxaJuros.set(Number(input.value));
  }

  resetarSimulacao() {
    this.valorSolicitado.set(10000);
    this.prazoMeses.set(12);
    this.taxaJuros.set(2);
  }

  irParaNovaSolicitacao() {
    this.router.navigate(['/solicitacoes/nova']);
  }
}
```

---

# PARTE 5 — CRIAR O HTML DO SIMULADOR

## Arquivo

```txt
src/app/features/simulador/components/simulador-credito/simulador-credito.html
```

## Conteúdo completo

```html
<app-header [title]="'SIMULATOR.TITLE' | translate"></app-header>

<main class="simulador-page">
  <section class="simulador-card" aria-labelledby="titulo-simulador">
    <div class="simulador-card__header">
      <div>
        <h2 id="titulo-simulador">
          {{ 'SIMULATOR.HEADING' | translate }}
        </h2>

        <p>
          {{ 'SIMULATOR.DESCRIPTION' | translate }}
        </p>
      </div>
    </div>

    <div class="simulador-grid">
      <section class="simulador-form" aria-labelledby="titulo-parametros">
        <h3 id="titulo-parametros">
          {{ 'SIMULATOR.PARAMETERS' | translate }}
        </h3>

        <div class="campo">
          <label for="valor">
            {{ 'SIMULATOR.VALUE' | translate }}
          </label>

          <input
            id="valor"
            type="range"
            min="1000"
            max="100000"
            step="1000"
            [value]="valorSolicitado()"
            (input)="alterarValor($event)"
          />

          <strong>
            {{ valorSolicitado() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
          </strong>
        </div>

        <div class="campo">
          <label for="prazo">
            {{ 'SIMULATOR.TERM' | translate }}
          </label>

          <input
            id="prazo"
            type="range"
            min="1"
            max="60"
            step="1"
            [value]="prazoMeses()"
            (input)="alterarPrazo($event)"
          />

          <strong>
            {{ prazoMeses() }} {{ 'SIMULATOR.MONTHS' | translate }}
          </strong>
        </div>

        <div class="campo">
          <label for="taxa">
            {{ 'SIMULATOR.RATE' | translate }}
          </label>

          <input
            id="taxa"
            type="number"
            min="0"
            max="20"
            step="0.1"
            [value]="taxaJuros()"
            (input)="alterarTaxa($event)"
          />

          <strong>
            {{ taxaJuros() }}%
          </strong>
        </div>

        <div class="acoes">
          <button type="button" class="btn-secundario" (click)="resetarSimulacao()">
            {{ 'SIMULATOR.RESET' | translate }}
          </button>

          <button type="button" class="btn-primario" (click)="irParaNovaSolicitacao()">
            {{ 'SIMULATOR.CREATE_REQUEST' | translate }}
          </button>
        </div>
      </section>

      <section class="resultado" aria-labelledby="titulo-resultado">
        <h3 id="titulo-resultado">
          {{ 'SIMULATOR.RESULT' | translate }}
        </h3>

        <div class="resultado-card destaque">
          <span>
            {{ 'SIMULATOR.INSTALLMENT' | translate }}
          </span>

          <strong>
            {{ valorParcela() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
          </strong>
        </div>

        <div class="resultado-card">
          <span>
            {{ 'SIMULATOR.TOTAL_PAID' | translate }}
          </span>

          <strong>
            {{ valorTotalPago() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
          </strong>
        </div>

        <div class="resultado-card">
          <span>
            {{ 'SIMULATOR.INTEREST_TOTAL' | translate }}
          </span>

          <strong>
            {{ totalJuros() | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
          </strong>
        </div>

        <p class="aviso">
          {{ 'SIMULATOR.DISCLAIMER' | translate }}
        </p>
      </section>
    </div>
  </section>
</main>
```

---

# PARTE 6 — CRIAR O SCSS DO SIMULADOR

## Arquivo

```txt
src/app/features/simulador/components/simulador-credito/simulador-credito.scss
```

## Conteúdo completo

```scss
.simulador-page {
  min-height: 100vh;
  padding: 24px;
  background: var(--page-bg);
  color: var(--text-main);
}

.simulador-card {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 24px;
}

.simulador-card__header {
  margin-bottom: 24px;
}

.simulador-card__header h2 {
  margin: 0 0 8px;
  font-size: 1.6rem;
}

.simulador-card__header p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.simulador-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.simulador-form,
.resultado {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  background: var(--page-bg);
}

.simulador-form h3,
.resultado h3 {
  margin: 0 0 18px;
  font-size: 1.1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.campo label {
  font-weight: 600;
}

.campo input[type='range'] {
  width: 100%;
}

.campo input[type='number'] {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-main);
  font-size: 1rem;
}

.campo strong {
  font-size: 1rem;
}

.acoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.btn-primario,
.btn-secundario {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primario {
  background: #2563eb;
  color: #ffffff;
}

.btn-primario:hover {
  background: #1d4ed8;
}

.btn-secundario {
  background: var(--card-bg);
  color: var(--text-main);
  border: 1px solid var(--border);
}

.btn-secundario:hover {
  background: var(--hover-bg);
}

.resultado {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resultado-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
}

.resultado-card span {
  color: var(--text-muted);
}

.resultado-card strong {
  font-size: 1.1rem;
}

.resultado-card.destaque strong {
  font-size: 1.4rem;
}

.aviso {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .simulador-grid {
    grid-template-columns: 1fr;
  }
}
```

---

# PARTE 7 — ADICIONAR ROTA DO SIMULADOR

## Arquivo

```txt
src/app/app.routes.ts
```

```ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login/login').then((m) => m.LoginComponent),
  },

  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista').then(
        (m) => m.SolicitacaoListaComponent,
      ),
    canActivate: [authGuard],
  },

  // ROTAS ESPECÍFICAS PRIMEIRO

  {
    path: 'solicitacoes/nova',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-form/solicitacao-form').then(
        (m) => m.SolicitacaoFormComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'solicitacoes/editar/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-form/solicitacao-form').then(
        (m) => m.SolicitacaoFormComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil/perfil-usuario/perfil-usuario').then(
        (m) => m.PerfilUsuarioComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'atividades',
    loadComponent: () =>
      import('./components/atividades/atividades-lista/atividades-lista').then(
        (m) => m.AtividadesListaComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'simulador',
    loadComponent: () =>
      import('./components/simulador-credito/simulador-credito').then(
        (m) => m.SimuladorCreditoComponent,
      ),
    canActivate: [authGuard],
  },

  // ROTA GENÉRICA SEMPRE POR ÚLTIMO

  {
    path: 'solicitacoes/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe').then(
        (m) => m.SolicitacaoDetalheComponent,
      ),
    canActivate: [authGuard],
  },
];
```


# PARTE 8 — ADICIONAR LINK NO HEADER

## Arquivo

```txt
src/app/components/shared/header/header.html
```

## Adicionar link

Dentro do bloco de navegação do usuário logado, adicionar:

```html
<a class="header__link" routerLink="/simulador">
  {{ 'ACTIONS.SIMULATOR' | translate }}
</a>
```

## Exemplo do bloco de navegação

```html
@if (authService.usuario() && !estaNaTelaLogin()) {
  <div class="header__auth">
    <a class="header__link" routerLink="/solicitacoes">
      {{ 'ACTIONS.REQUESTS' | translate }}
    </a>

    <a class="header__link" routerLink="/simulador">
      {{ 'ACTIONS.SIMULATOR' | translate }}
    </a>

    <a class="header__link" routerLink="/atividades">
      {{ 'ACTIONS.ACTIVITIES' | translate }}
    </a>

    <a class="header__link" routerLink="/perfil">
      {{ 'ACTIONS.PROFILE' | translate }}
    </a>

    <button type="button" class="header__logout" (click)="logout()">
      {{ 'ACTIONS.LOGOUT' | translate }}
    </button>
  </div>
}
```

---

# PARTE 9 — AJUSTAR ARQUIVOS DE TRADUÇÃO

## Arquivo

```txt
public/assets/i18n/pt-BR.json
```

Adicionar ou ajustar:

```json
{
  "ACTIONS": {
    "REQUESTS": "Solicitações",
    "ACTIVITIES": "Atividades",
    "SIMULATOR": "Simulador",
    "NEW_REQUEST": "Nova Solicitação",
    "EDIT": "Editar",
    "ANALYZE": "Analisar",
    "DELETE": "Excluir",
    "LOGOUT": "Sair",
    "PROFILE": "Perfil"
  },
  "SIMULATOR": {
    "TITLE": "Simulador de Crédito",
    "HEADING": "Simule uma proposta de crédito",
    "DESCRIPTION": "Informe valor, prazo e taxa mensal para estimar parcela, total pago e juros.",
    "PARAMETERS": "Parâmetros da simulação",
    "VALUE": "Valor solicitado",
    "TERM": "Prazo",
    "RATE": "Taxa de juros mensal",
    "MONTHS": "meses",
    "RESULT": "Resultado da simulação",
    "INSTALLMENT": "Parcela aproximada",
    "TOTAL_PAID": "Total pago",
    "INTEREST_TOTAL": "Total de juros",
    "RESET": "Resetar",
    "CREATE_REQUEST": "Criar solicitação",
    "DISCLAIMER": "Esta simulação é apenas uma estimativa e não representa aprovação de crédito."
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/en-US.json
```

Adicionar ou ajustar:

```json
{
  "ACTIONS": {
    "REQUESTS": "Requests",
    "ACTIVITIES": "Activities",
    "SIMULATOR": "Simulator",
    "NEW_REQUEST": "New Request",
    "EDIT": "Edit",
    "ANALYZE": "Analyze",
    "DELETE": "Delete",
    "LOGOUT": "Sign out",
    "PROFILE": "Profile"
  },
  "SIMULATOR": {
    "TITLE": "Credit Simulator",
    "HEADING": "Simulate a credit proposal",
    "DESCRIPTION": "Enter amount, term and monthly interest rate to estimate installment, total paid and interest.",
    "PARAMETERS": "Simulation parameters",
    "VALUE": "Requested amount",
    "TERM": "Term",
    "RATE": "Monthly interest rate",
    "MONTHS": "months",
    "RESULT": "Simulation result",
    "INSTALLMENT": "Estimated installment",
    "TOTAL_PAID": "Total paid",
    "INTEREST_TOTAL": "Total interest",
    "RESET": "Reset",
    "CREATE_REQUEST": "Create request",
    "DISCLAIMER": "This simulation is only an estimate and does not represent credit approval."
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/es-ES.json
```

Adicionar ou ajustar:

```json
{
  "ACTIONS": {
    "REQUESTS": "Solicitudes",
    "ACTIVITIES": "Actividades",
    "SIMULATOR": "Simulador",
    "NEW_REQUEST": "Nueva Solicitud",
    "EDIT": "Editar",
    "ANALYZE": "Analizar",
    "DELETE": "Eliminar",
    "LOGOUT": "Salir",
    "PROFILE": "Perfil"
  },
  "SIMULATOR": {
    "TITLE": "Simulador de Crédito",
    "HEADING": "Simula una propuesta de crédito",
    "DESCRIPTION": "Ingrese valor, plazo y tasa mensual para estimar cuota, total pagado e intereses.",
    "PARAMETERS": "Parámetros de simulación",
    "VALUE": "Valor solicitado",
    "TERM": "Plazo",
    "RATE": "Tasa de interés mensual",
    "MONTHS": "meses",
    "RESULT": "Resultado de la simulación",
    "INSTALLMENT": "Cuota aproximada",
    "TOTAL_PAID": "Total pagado",
    "INTEREST_TOTAL": "Total de intereses",
    "RESET": "Restablecer",
    "CREATE_REQUEST": "Crear solicitud",
    "DISCLAIMER": "Esta simulación es solo una estimación y no representa aprobación de crédito."
  }
}
```

---

## Arquivo

```txt
public/assets/i18n/it-IT.json
```

Adicionar ou ajustar:

```json
{
  "ACTIONS": {
    "REQUESTS": "Richieste",
    "ACTIVITIES": "Attività",
    "SIMULATOR": "Simulatore",
    "NEW_REQUEST": "Nuova Richiesta",
    "EDIT": "Modifica",
    "ANALYZE": "Analizza",
    "DELETE": "Elimina",
    "LOGOUT": "Esci",
    "PROFILE": "Profilo"
  },
  "SIMULATOR": {
    "TITLE": "Simulatore di Credito",
    "HEADING": "Simula una proposta di credito",
    "DESCRIPTION": "Inserisci valore, durata e tasso mensile per stimare rata, totale pagato e interessi.",
    "PARAMETERS": "Parametri della simulazione",
    "VALUE": "Valore richiesto",
    "TERM": "Durata",
    "RATE": "Tasso di interesse mensile",
    "MONTHS": "mesi",
    "RESULT": "Risultato della simulazione",
    "INSTALLMENT": "Rata stimata",
    "TOTAL_PAID": "Totale pagato",
    "INTEREST_TOTAL": "Totale interessi",
    "RESET": "Reimposta",
    "CREATE_REQUEST": "Crea richiesta",
    "DISCLAIMER": "Questa simulazione è solo una stima e non rappresenta approvazione del credito."
  }
}
```

---

# PARTE 10 — TESTAR O SIMULADOR

## Passo a passo

```txt
1. Fazer login.
2. Acessar /simulador.
3. Alterar o valor solicitado.
4. Alterar o prazo.
5. Alterar a taxa de juros.
6. Confirmar que a parcela muda automaticamente.
7. Confirmar que o total pago muda automaticamente.
8. Confirmar que o total de juros muda automaticamente.
9. Clicar em Resetar.
10. Confirmar que os valores voltam ao padrão.
11. Clicar em Criar solicitação.
12. Confirmar que a aplicação navega para /solicitacoes/nova.
```

---

# PARTE 11 — EXPLICAR FEATURE FIRST

## Estrutura atual comum

```txt
src/app/components
src/app/services
src/app/models
src/app/guards
src/app/interceptors
```

## Nova estrutura

```txt
src/app/core
src/app/shared
src/app/features
```

## Responsabilidade de cada pasta

```txt
core:
serviços centrais da aplicação
auth
guards
interceptors
tokens
preferences

shared:
componentes reutilizáveis
header
componentes visuais genéricos

features:
funcionalidades da aplicação
solicitacoes
atividades
perfil
simulador
```

---

# PARTE 12 — CRIAR ESTRUTURA FEATURE FIRST

Criar as pastas:

```txt
src/app/core/auth
src/app/core/preferences
src/app/core/tokens

src/app/shared/components/header

src/app/features/solicitacoes/components
src/app/features/solicitacoes/services
src/app/features/solicitacoes/models

src/app/features/atividades/components
src/app/features/atividades/services
src/app/features/atividades/models

src/app/features/perfil/components

src/app/features/simulador/components
```

---

# PARTE 13 — MOVER ARQUIVOS PARA FEATURE FIRST

## Solicitações

Mover:

```txt
src/app/components/solicitacoes
```

para:

```txt
src/app/features/solicitacoes/components
```
---
Mover:

```txt
src/app/services/graphql.service.ts
```

para:

```txt
src/app/features/solicitacoes/services/solicitacoes.service.ts
```
---
Mover:

```txt
src/app/services/solicitacoes.facade.ts
```

para:

```txt
src/app/features/solicitacoes/services/solicitacoes.facade.ts
```
---
Mover:

```txt
src/app/models/solicitacao.model.ts
```

para:

```txt
src/app/features/solicitacoes/models/solicitacao.model.ts
```

---

## Atividades

Mover:

```txt
src/app/services/atividades.service.ts
```

para:

```txt
src/app/features/atividades/services/atividades.service.ts
```

Mover:

```txt
src/app/models/atividade.model.ts
```

para:

```txt
src/app/features/atividades/models/atividade.model.ts
```
---
Mover a pasta de componentes de atividades, se existir:

```txt
src/app/components/atividades
```

para:

```txt
src/app/features/atividades/components
```

---

## Perfil

Mover:

```txt
src/app/components/perfil
```

para:

```txt
src/app/features/perfil/components
```

---

## Header

Mover:

```txt
src/app/components/shared/header
```

para:

```txt
src/app/shared/components/header
```

---

## Auth

Mover:

```txt
src/app/services/auth.service.ts
src/app/guards/auth.guard.ts
src/app/interceptors/auth.interceptor.ts
```

para:

```txt
src/app/core/auth
```

---

## Preferences

Mover:

```txt
src/app/services/preferences.service.ts
```

para:

```txt
src/app/core/preferences/preferences.service.ts
```

---

## Tokens

Mover:

```txt
src/app/services/storage.token.ts
```

para:

```txt
src/app/core/tokens/storage.token.ts
```

---

# PARTE 14 — AJUSTAR IMPORTS APÓS MOVER OS ARQUIVOS

## Exemplos de ajustes

Antes:

```ts
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
```

Depois, dentro de componentes de solicitações:

```ts
import { SolicitacoesFacade } from '../../services/solicitacoes.facade';
```

---

Antes:

```ts
import { SolicitacaoViewModel } from '../../../services/graphql.service';
```

Depois:

```ts
import { SolicitacaoViewModel } from '../../services/solicitacoes.service';
```

---

Antes:

```ts
import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';
```

Depois, dentro do service de solicitações:

```ts
import { Solicitacao, StatusSolicitacao } from '../models/solicitacao.model';
```

---

Antes:

```ts
import { AtividadesService } from './atividades.service';
```

Depois, dentro do service de solicitações:

```ts
import { AtividadesService } from '../../atividades/services/atividades.service';
```

---

Antes:

```ts
import { AuthService } from './auth.service';
```

Depois, dentro do service de solicitações:

```ts
import { AuthService } from '../../../core/auth/auth.service';
```

---

Antes:

```ts
import { HeaderComponent } from '../../shared/header/header';
```

Depois, dentro das features:

```ts
import { HeaderComponent } from '../../../../shared/components/header/header';
```

---

# PARTE 15 — AJUSTAR APP.ROUTES.TS APÓS FEATURE FIRST

## Arquivo

```txt
src/app/app.routes.ts
```


```ts
import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'solicitacoes',
    loadComponent: () =>
      import(
        './features/solicitacoes/components/solicitacao-lista/solicitacao-lista'
      ).then((m) => m.SolicitacaoListaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'solicitacoes/nova',
    loadComponent: () =>
      import(
        './features/solicitacoes/components/solicitacao-form/solicitacao-form'
      ).then((m) => m.SolicitacaoFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'solicitacoes/editar/:id',
    loadComponent: () =>
      import(
        './features/solicitacoes/components/solicitacao-form/solicitacao-form'
      ).then((m) => m.SolicitacaoFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'simulador',
    loadComponent: () =>
      import(
        './features/simulador/components/simulador-credito/simulador-credito'
      ).then((m) => m.SimuladorCreditoComponent),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/perfil/components/perfil-usuario/perfil-usuario').then(
        (m) => m.PerfilUsuarioComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'atividades',
    loadComponent: () =>
      import(
        './features/atividades/components/atividades-lista/atividades-lista'
      ).then((m) => m.AtividadesListaComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
```

---

# PARTE 16 — AJUSTAR APP.CONFIG.TS APÓS FEATURE FIRST

## Arquivo

```txt
src/app/app.config.ts
```

## Imports que mudam

Antes:

```ts
import { authInterceptor } from './interceptors/auth.interceptor';
import { STORAGE_KEY } from './services/storage.token';
```

Depois:

```ts
import { authInterceptor } from './core/auth/auth.interceptor';
import { STORAGE_KEY } from './core/tokens/storage.token';
```

---

# PARTE 17 — AJUSTAR IMPORT DO SIMULADOR APÓS MOVER HEADER

Depois que o header for movido para:

```txt
src/app/shared/components/header
```

Ajustar o import no simulador.

## Arquivo

```txt
src/app/features/simulador/components/simulador-credito/simulador-credito.ts
```

Trocar:

```ts
import { HeaderComponent } from '../../../../components/shared/header/header';
```

por:

```ts
import { HeaderComponent } from '../../../../shared/components/header/header';
```

---

# PARTE 18 — TESTAR O PROJETO APÓS FEATURE FIRST

Rodar:

```bash
ng serve --open
```

Testar:

```txt
1. A aplicação abre.
2. Login funciona.
3. /solicitacoes funciona.
4. /solicitacoes/nova funciona.
5. Edição funciona.
6. Exclusão funciona.
7. /simulador funciona.
8. /perfil funciona.
9. /atividades funciona.
10. Header continua aparecendo.
11. Tema claro e escuro continuam funcionando.
12. Idioma continua funcionando.
13. Firestore continua carregando solicitações.
14. Central de atividades continua registrando ações.
```

---

# PARTE FINAL — DEPLOY NO FIREBASE

---


##  ANTES DE COMEÇAR

Antes de fazer o deploy, precisamos garantir algumas coisas:

- o projeto Angular está funcionando localmente;
- o Firebase já foi configurado no projeto;
- o login está funcionando;
- o Firestore está recebendo os registros;
- o Firebase CLI está instalado;
- estamos logados na conta correta do Firebase.

---

## INSTALAR O FIREBASE CLI

O Firebase CLI é a ferramenta de linha de comando do Firebase.

É com ele que conseguimos conectar o projeto local ao Firebase e publicar a aplicação.

No terminal, execute:

npm install -g firebase-tools

Depois, confira se a instalação funcionou:

firebase --version

Se aparecer a versão do Firebase CLI, está tudo certo.

---

## FAZER LOGIN NO FIREBASE

Execute:

firebase login

O navegador vai abrir.

Entre com a mesma conta Google usada para criar o projeto no Firebase.

Depois de fazer login, volte para o terminal.

Se aparecer uma mensagem indicando que o login foi concluído, podemos continuar.

---

## GERAR A VERSÃO DE PRODUÇÃO DO ANGULAR


No terminal, dentro da pasta do projeto Angular, execute:

ng build

Ou, se o projeto estiver usando npm scripts:

npm run build



---

## INICIAR O FIREBASE NO PROJETO


No terminal, ainda dentro da pasta do projeto, execute:

firebase init hosting

O Firebase vai fazer algumas perguntas.

Responda assim:

Are you ready to proceed?
Yes

Depois ele vai perguntar qual projeto Firebase queremos usar.

Escolha:

Use an existing project

Selecione o projeto que vocês criaram no Firebase Console.

Depois ele vai perguntar qual pasta deve ser usada como pasta pública.

Aqui é muito importante colocar a pasta correta do build.

Exemplo:

dist/painel-credito/browser

Atenção:

troque painel-credito pelo nome real do projeto de vocês.

Se tiver dúvida, abra a pasta dist e veja o nome gerado.

---

## CONFIGURAÇÕES DO FIREBASE HOSTING

Depois o Firebase vai perguntar:

Configure as a single-page app?

Responda:

Yes

Por quê?

Porque o Angular é uma SPA, ou seja, uma Single Page Application.

Isso significa que o Angular controla as rotas no frontend.

Então, se o usuário acessar diretamente uma rota como:

/solicitacoes

ou:

/login

o Firebase precisa redirecionar essa rota para o index.html.

Se não fizermos isso, a aplicação pode funcionar na home, mas quebrar quando atualizarmos uma rota interna.

Depois ele pode perguntar:

Set up automatic builds and deploys with GitHub?

Para esta aula, responda:

No

Neste momento vamos fazer o deploy manual pelo terminal.

Se ele perguntar se pode sobrescrever o index.html, responda:

No

Porque o index.html já foi gerado pelo Angular dentro da pasta dist.

---

## ARQUIVOS CRIADOS PELO FIREBASE

Depois da configuração, o Firebase vai criar alguns arquivos no projeto.

Os principais são:

firebase.json
.firebaserc

O arquivo .firebaserc guarda a referência do projeto Firebase usado.

O arquivo firebase.json guarda as configurações do Hosting.

Ele deve ficar parecido com isso:

{
  "hosting": {
    "public": "dist/painel-credito/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

O ponto mais importante aqui é o public.

Ele precisa apontar para a pasta final gerada pelo Angular.

E o segundo ponto importante é o rewrites.

Esse trecho garante que as rotas do Angular funcionem corretamente no Firebase Hosting.

---

## 10. FAZER O DEPLOY

Agora sim vamos publicar a aplicação.

Execute:

firebase deploy

O Firebase vai pegar os arquivos da pasta configurada no firebase.json e publicar no Hosting.

No final, ele vai mostrar uma URL parecida com esta:

Hosting URL: https://nome-do-projeto.web.app

Essa é a URL pública da aplicação.

Abra essa URL no navegador e teste o sistema.

---

## TESTAR A APLICAÇÃO PUBLICADA

Depois do deploy, precisamos testar o fluxo principal.

Acesse a URL gerada pelo Firebase Hosting.

Teste:

1. Abrir a aplicação publicada.
2. Entrar na tela de login.
3. Fazer login com e-mail e senha ou Google.
4. Verificar se o login funciona.
5. Acessar a tela de atividades.
6. Conferir se os dados aparecem corretamente.
7. Criar uma nova atividade de login.
8. Abrir o Firebase Console.
9. Entrar em Firestore Database.
10. Confirmar se o documento foi criado na coleção correta.
11. Atualizar a página em uma rota interna.
12. Conferir se a aplicação não quebra ao recarregar.

Esse último teste é importante por causa das rotas do Angular.

Se a aplicação quebrar ao atualizar uma rota interna, provavelmente falta configurar o rewrite para o index.html.

---

## PROBLEMA COM LOGIN GOOGLE NO DEPLOY

Se o login com Google funcionar no localhost, mas não funcionar na URL publicada, provavelmente falta liberar o domínio no Firebase Authentication.

Para corrigir:

1. Abra o Firebase Console.
2. Entre no projeto.
3. Vá em Authentication.
4. Clique em Settings.
5. Abra a aba Authorized domains.
6. Adicione o domínio gerado pelo Firebase Hosting.

Exemplo:

nome-do-projeto.web.app

Também pode ser necessário adicionar:

nome-do-projeto.firebaseapp.com

Depois disso, teste o login novamente.

---

## PROBLEMA COM VARIÁVEIS DO FIREBASE

Se a aplicação publicada abrir, mas não conectar corretamente no Firebase, confira se o arquivo de ambiente está correto.

Verifique se o environment.ts ou o arquivo equivalente contém as credenciais corretas do projeto Firebase usado na aula.

Exemplo:

export const environment = {
  production: false,
  firebase: {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJETO',
    storageBucket: 'SEU_PROJETO.firebasestorage.app',
    messagingSenderId: 'SEU_SENDER_ID',
    appId: 'SEU_APP_ID'
  }
};

O projeto configurado no Angular precisa ser o mesmo projeto selecionado no firebase init hosting.

Se você configurou o Angular com um Firebase e fez deploy em outro projeto, a aplicação pode não funcionar como esperado.

---

## QUANDO ALTERAR O PROJETO

Sempre que você alterar o código Angular, precisa gerar um novo build e fazer um novo deploy.

O fluxo fica assim:

ng build
firebase deploy

Ou:

npm run build
firebase deploy

O Firebase não publica automaticamente as mudanças locais.

Ele publica aquilo que está dentro da pasta dist.

Então, se você mudou o código e rodou apenas firebase deploy, mas não rodou o build antes, talvez a alteração não apareça na URL publicada.

---

## FECHAMENTO DA AULA


A aplicação tem:

- login;
- autenticação;
- integração com Firebase;
- registro de dados;
- proteção de acesso;
- build de produção;
- deploy;
- URL pública.

---

# CHECKLIST FINAL DA AULA 13

## Simulador

```txt
[ ] Feature simulador criada.
[ ] Componente simulador criado.
[ ] Rota /simulador criada.
[ ] Link no header criado.
[ ] Cálculo de parcela funcionando.
[ ] Cálculo de total pago funcionando.
[ ] Cálculo de juros funcionando.
[ ] Reset funcionando.
[ ] Botão Criar solicitação navegando para /solicitacoes/nova.
```

---

## Feature First

```txt
[ ] Pasta core criada.
[ ] Pasta shared criada.
[ ] Pasta features criada.
[ ] Solicitações movidas para features/solicitacoes.
[ ] Atividades movidas para features/atividades.
[ ] Perfil movido para features/perfil.
[ ] Simulador criado em features/simulador.
[ ] Header movido para shared.
[ ] Auth movido para core/auth.
[ ] Preferences movido para core/preferences.
[ ] Tokens movido para core/tokens.
[ ] Imports ajustados.
[ ] Rotas ajustadas.
[ ] App config ajustado.
```

---

## Projeto final

```txt
[ ] Login funciona.
[ ] Logout funciona.
[ ] Rotas protegidas funcionam.
[ ] Solicitações carregam do Firestore.
[ ] Nova solicitação salva no Firestore.
[ ] Edição atualiza Firestore.
[ ] Exclusão remove do Firestore.
[ ] Atividades são registradas.
[ ] Perfil funciona.
[ ] Tema funciona.
[ ] Idioma funciona.
[ ] Simulador funciona.
[ ] Estrutura Feature First organizada.
```

---
