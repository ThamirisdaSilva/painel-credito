# AULA 4 — PERFORMANCE (APLICADA NO SEU PROJETO REAL)

---

# OBJETIVO

Aplicar otimizações reais em cima do código atual:

- reduzir custo da API GraphQL
- evitar re-render desnecessário
- melhorar performance de lista
- preparar para escala (muitos dados)

---

# ETAPA 1 — IDENTIFICANDO OS PROBLEMAS ATUAIS

---

## PROBLEMA 1 — TRACK ERRADO NA LISTA

Hoje você está usando:

```html
@for (solicitacao of service.solicitacoes(); track $index)
```

Problema:

- Angular usa índice como referência
- qualquer mudança → recria TODOS os itens
- isso destrói performance

---

## PROBLEMA 2 — COMPONENTE SEM OnPush

Todos os itens estão com change detection padrão

Impacto:

- Angular verifica tudo o tempo todo
- cada atualização dispara re-render geral

---

## PROBLEMA 3 — QUERY PESADA

Hoje você busca:

```graphql
id
cliente
documento
valor
status
dataSolicitacao
```

Mas nem sempre precisa de tudo

---

## PROBLEMA 4 — NO-CACHE

```ts
fetchPolicy: 'no-cache'
```

Impacto:

- toda navegação faz request
- zero reaproveitamento

---

# ETAPA 2 — OTIMIZAÇÃO 1 (TRACK CORRETO)

---

## ALTERAR — solicitacao-lista.html

```html
<div class="lista">
  @for (solicitacao of service.solicitacoes(); track solicitacao.id) {
    <app-solicitacao-item [solicitacao]="solicitacao" />
  }
</div>
```

---

## RESULTADO

- Angular reutiliza elementos do DOM
- evita recriação de componentes
- melhora MUITO listas grandes

---

# ETAPA 3 — OTIMIZAÇÃO 2 (OnPush)

---

## ALTERAR — solicitacao-item.ts

```ts
import { ChangeDetectionStrategy } from '@angular/core';

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
}
```

---

## RESULTADO

- cada item só atualiza quando o input muda
- elimina re-render desnecessário

---

# ETAPA 4 — OTIMIZAÇÃO 3 (SERVICE COM CACHE)

---

## ALTERAR — graphql.service.ts

```ts
this.apollo.query<{ solicitacoes: Solicitacao[] }>({
  query: gql`
    query {
      solicitacoes {
        id
        cliente
        valor
        status
      }
    }
  `,
  fetchPolicy: 'cache-first'
})
```

---

## MUDANÇAS

- remove campos não essenciais
- troca `no-cache` por `cache-first`

---

## RESULTADO

- menos dados trafegados
- cache automático
- menos chamadas à API

---

# ETAPA 5 — OTIMIZAÇÃO 4 (EVITAR REPROCESSAMENTO)

---

## PROBLEMA

Sempre que a API responde, você recria tudo:

```ts
const viewModel = data.map(...)
this.solicitacoes.set([...viewModel]);
```

---

## MELHORIA

Evitar recriação desnecessária:

```ts
this.solicitacoes.set(viewModel);
```

(remover spread)

---

## RESULTADO

- menos alocação de memória
- menos GC
- mais performance

---

# ETAPA 6 — OTIMIZAÇÃO 5 (VIRTUAL SCROLL)

---

## INSTALAR

```bash
npm install @angular/cdk
```

---

## ALTERAR — solicitacao-lista.ts

```ts
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent, HeaderComponent, ScrollingModule],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
```

---

## ALTERAR — solicitacao-lista.html

```html
<app-header title="Painel de Solicitações de Crédito" />

@if (service.loading()) {
  <p>Carregando...</p>
} @else {
  @if (service.solicitacoes().length === 0) {
    <p>Nenhuma solicitação encontrada.</p>
  } @else {

    <cdk-virtual-scroll-viewport itemSize="140" class="viewport">

      <div *cdkVirtualFor="let solicitacao of service.solicitacoes(); trackBy: trackById">
        <app-solicitacao-item [solicitacao]="solicitacao" />
      </div>

    </cdk-virtual-scroll-viewport>

  }
}
```

---

## ADICIONAR — solicitacao-lista.ts

```ts
trackById(index: number, item: SolicitacaoViewModel) {
  return item.id;
}
```

---

## ADICIONAR — solicitacao-lista.scss

```scss
.viewport {
  height: 600px;
  width: 100%;
}
```

---

## RESULTADO

- renderiza só itens visíveis
- suporta milhares de registros
- scroll fluido

---

# ETAPA 7 — OTIMIZAÇÃO 6 (COMPONENTE DE LISTA MAIS EFICIENTE)

---

## ALTERAR — solicitacao-lista.ts

```ts
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent, HeaderComponent, ScrollingModule],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

---

## RESULTADO

- lista inteira não re-renderiza à toa
- melhora geral da aplicação

---

# ETAPA 8 — OTIMIZAÇÃO 7 (BUNDLE)

---

## BUILD

```bash
ng build --configuration production --source-map
```

---

## ANALISAR

```bash
npx source-map-explorer dist/**/*.js
```

---

## O QUE OLHAR

- libs grandes
- duplicações
- imports desnecessários

---

# RESULTADO FINAL

Após todas as otimizações:

- menos chamadas na API
- payload menor
- renderização controlada
- lista performática
- scroll fluido
- melhor experiência do usuário

---

# RESUMO DAS MELHORIAS

- track por id (não por index)
- OnPush nos componentes
- cache GraphQL
- redução de payload
- virtual scroll
- menos recriação de objetos
- lazy rendering

```