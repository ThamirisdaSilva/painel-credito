# PLANO DE AULAS — PROJETO: PAINEL DE SOLICITAÇÕES DE CRÉDITO

## VISÃO GERAL DO PROJETO

Ao longo das aulas, será desenvolvido um painel de solicitações de crédito inspirado em sistemas reais utilizados por instituições financeiras.

A aplicação permitirá visualizar, acompanhar e gerenciar solicitações de crédito, apresentando informações como cliente, valor solicitado, status e data da requisição.

O projeto será evoluído progressivamente, partindo de uma estrutura simples com dados simulados até uma aplicação mais próxima de um cenário real, incorporando consumo de API, tratamento de estados, segurança, performance, organização arquitetural e boas práticas de desenvolvimento.

O objetivo é que, ao final, os alunos compreendam não apenas como construir interfaces em Angular, mas como estruturar aplicações frontend de forma escalável, performática e alinhada com demandas do mercado.

---

## AULA 1 — BASE DO PROJETO E REVISÃO DE FUNDAMENTOS

### Temas
- Contexto do projeto (painel de crédito no mundo real)
- Revisão prática:
  - Componentes
  - Data binding
  - Diretivas (`ngFor`)
  - Pipes
- Componentização (lista -s item)
- Modelagem de dados (interface)
- Dados mock (simulação)
- Introdução a estado (loading simples)

### Projeto
- Criar projeto Angular
- Criar estrutura inicial (`solicitacoes`)
- Criar componentes (lista + item)
- Criar interface `Solicitacao`
- Criar dados mock
- Renderizar lista
- Simular loading

---

## AULA 2 — API DESIGN, REST, GRAPHQL E ESTADO DE REQUISIÇÃO

### Temas
- API Design: verbos HTTP, status codes, boas práticas de design de endpoints
- GraphQL: conceito, queries vs mutations, quando usar em vez de REST
- Service Angular (`HttpClient` tipado)
- Ciclo de vida dos componentes
- Separação de responsabilidades
- Lazy Loading
- Estados de requisição:
  - loading
  - success
  - error
- Introdução a Signals (estado local)
- Debug

### Projeto
- Criar `solicitacoes.service` com `HttpClient` tipado
- Subir API mock com `json-server`
- Substituir mock por chamada REST real (CRUD)
- Tipar respostas da API com interfaces
- Demonstrar diferença conceitual REST vs GraphQL (consumo de API pública)
- Implementar loading com signal
- Implementar lazy loading (rotas)
- Implementar estado de erro

---

## AULA 3 — SEGURANÇA NO FRONTEND

### Temas
- JWT (estrutura, claims, expiração, armazenamento seguro)
- Authorization Header
- Interceptor de autenticação
- OAuth 2.0 (Authorization Code + PKCE para SPAs, tokens, scopes)
- Guards de rota (`CanActivate`, `CanMatch`)
- CORS (erros reais, como resolver)
- CSP (Content Security Policy): headers de segurança, prevenção de XSS
- `DomSanitizer` do Angular (sanitização de conteúdo dinâmico)

### Projeto
- Criar `AuthService` com login simulado (retorna JWT mock)
- Criar interceptor que injeta `Authorization: Bearer`
- Decode JWT e consumir dados armazenados no token
- Criar `AuthGuard` protegendo rota de solicitações
- Simular erro 401 → redirect para login
- Provocar e resolver erro de CORS
- Configurar meta tag CSP e demonstrar bloqueio de script inline

---

## AULA 4 — PERFORMANCE (DIAGNÓSTICO + OTIMIZAÇÃO)

### Temas
- O que é performance no frontend
- Web Vitals (LCP, INP, CLS — visão prática)
- DevTools (Network / Performance / Lighthouse)
- Code splitting e Lazy Loading avançado (`loadComponent`, `loadChildren`)
- Bundling: como o Angular CLI empacota, análise de bundle (`source-map-explorer`)
- Tree-shaking: o que é, imports que quebram tree-shaking
- Change Detection otimizada (`OnPush`, Signals, `trackBy`)
- Virtual Scrolling (`@angular/cdk`) para listas grandes
- Preloading strategies

### Projeto
- Medir performance da aplicação (Lighthouse)
- Simular problema (lista grande / delay)
- Identificar gargalos
- Analisar bundle com `source-map-explorer`
- Implementar `OnPush` e `trackBy`
- Implementar Virtual Scrolling (simular 10k itens)
- Comparar antes/depois

---

## AULA 5 — PWA E OFFLINE FIRST

### Temas
- Conceito de PWA (installable, reliable, fast)
- Service Workers: ciclo de vida (install, activate, fetch), interceptação de requests
- `@angular/pwa`: setup, `ngsw-config.json`, `manifest.webmanifest`
- Estratégias de cache: Cache First, Network First, Stale While Revalidate
- Offline First: detectar status de rede, fallback gracioso
- Web App Manifest: ícones, splash screen, theme color

### Projeto
- Adicionar `@angular/pwa` ao projeto
- Configurar `ngsw-config.json` (cache de assets + API)
- Testar modo offline no DevTools (Application → Service Workers)
- Implementar banner "Você está offline" com detecção de rede
- Simular ausência de API e verificar dados servidos do cache
- Instalar a PWA no desktop e testar

---

## AULA 6 — Evolução e Padronização do Frontend

### Temas
- Evolução de sistemas frontend (de tela simples para sistema com múltiplas páginas)
- Roteamento no Angular (`Router`, `ActivatedRoute`)
- Componentização por feature (lista, detalhe, filtro, busca, resumo)
- Comunicação entre componentes (`@Input`, `@Output`)
- Separação de responsabilidades (na prática)
- Ações de negócio no frontend (aprovar/reprovar)
- Padronização de código (ESLint, Prettier)
- Automação básica com Husky (pre-commit)

### Projeto
- Criar nova página de detalhe:
- Configurar rota
- Implementar navegação:
- Capturar `id` com `ActivatedRoute`
- Buscar dados da solicitação no service
- Implementar ações na tela de detalhe:
  - botão "Aprovar"
  - botão "Reprovar"
- Criar métodos no componente
- Implementar método no service
- Atualizar estado da aplicação após ação
- Criar componentes na lista
- Evoluir `solicitacao-lista`
- Implementar comunicação entre componentes
- Adicionar interação no `solicitacao-item`
- Padronizar código
- Configurar tooling


---

## AULA 7 — API Design, REST e GraphQL (Convidado)

### Temas
- REST vs GraphQL
- Estrutura de APIs
- Contratos de dados
- Boas práticas de design de API

### Projeto
- Analisar exemplos de APIs REST e GraphQL
- Comparar payloads e flexibilidade de dados
- Identificar boas e más práticas em contratos de API
- Relacionar decisões de backend com impacto no frontend

---

## AULA 8 — Arquitetura, SOLID e Segurança (Convidado)

### Temas
- Princípios SOLID aplicados ao frontend
- Design Patterns:
  - Facade
  - Repository
  - Strategy
- Segurança:
  - JWT
  - OAuth (visão geral)
  - CORS e CSP

### Projeto
- Analisar o projeto atual sob a ótica de SOLID
- Identificar responsabilidades mal distribuídas
- Mapear pontos de melhoria para refatoração
- Relacionar fluxo atual com conceitos de segurança (token, interceptor, guard)

---

## AULA 9 — Refatoração Arquitetural e Estado Reativo

### Temas
- Smart vs Dumb Components
- Facade Pattern
- Injeção de dependência avançada (`InjectionToken`)
- Cache reativo com RxJS (`shareReplay`)

### Projeto
- Criar `SolicitacoesFacade` para centralizar lógica da aplicação
- Refatorar componentes para foco em UI (dumb components)
- Remover lógica de negócio do componente de lista
- Implementar cache em memória com `shareReplay`
- Evitar múltiplas chamadas à API
- Ajustar fluxo de dados entre facade e componentes

---

## AULA 10 — Performance (Fechamento), Internacionalização e Acessibilidade

### Temas
- Diagnóstico de performance:
  - DevTools (Network / Performance)
  - Lighthouse
- Identificação de gargalos
- Revisão de otimizações (virtual scroll, trackBy, OnPush)

- i18n vs l10n
- `ngx-translate`
- Locale dinâmico

- Acessibilidade (base):
  - WCAG
  - Semântica HTML
  - ARIA
  - Navegação por teclado

### Projeto
- Analisar aplicação com DevTools (Network e Performance)
- Rodar Lighthouse e interpretar resultados
- Simular lentidão de API e observar impacto
- Validar otimizações existentes (virtual scroll, trackBy, OnPush)
- Instalar `@ngx-translate/core` e `@ngx-translate/http-loader`
- Criar arquivos de tradução (`pt-BR`, `en-US`)
- Implementar seletor de idioma no header
- Aplicar pipe `translate` nos componentes
- Formatar datas e valores monetários por locale
- Corrigir semântica HTML (uso de tags adequadas)
- Adicionar ARIA labels nos componentes
- Implementar navegação por teclado na lista

---

## AULA 11 — Tempo Real, Observabilidade e Acessibilidade Avançada

### Temas
- Polling vs WebSockets
- Atualização em tempo real
- Observabilidade:
  - logs estruturados
  - tratamento global de erros
  - monitoramento

- Acessibilidade avançada:
  - Live Regions
  - Focus management
  - feedback dinâmico

### Projeto
- Implementar polling simples com `interval` + `switchMap`
- Criar `RealtimeService` com simulação de eventos (RxJS `Subject`)
- Atualizar status de solicitações em tempo real
- Exibir indicador visual de atualização ("ao vivo")
- Criar interceptor para log de erros de API
- Implementar tratamento global de erros
- Utilizar `aria-live` para comunicar mudanças dinâmicas
- Ajustar foco e interação em atualizações da UI

---

## AULA 12 — Entrega, Produção e Checklist Final

### Temas
- Trade-offs técnicos
- Checklist de produção
- Qualidade de aplicação frontend
- Revisão geral de arquitetura

### Projeto
- Revisar performance da aplicação (Lighthouse)
- Validar funcionamento offline (PWA)
- Validar comportamento de cache
- Validar fluxo de erro e observabilidade
- Revisar acessibilidade (pontuação Lighthouse)
- Ajustar inconsistências finais de UI e código
- Consolidar aplicação para portfólio
- Apresentar decisões técnicas tomadas durante o projeto

---