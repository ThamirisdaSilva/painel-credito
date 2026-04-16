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

## AULA 6 — CODE QUALITY, AUTOMAÇÃO E CODE REVIEW

### Temas
- ESLint: configuração para Angular (`@angular-eslint`), regras essenciais
- Prettier: formatação automática, integração com ESLint (`eslint-config-prettier`)
- Husky + lint-staged: hooks de pre-commit para garantir padrão antes do push
- Conventional Commits (padrão de mensagens)
- Code Review: boas práticas, checklist para PRs Angular, como dar feedback
- Clean Code: nomes significativos, funções pequenas, early return
- Design Patterns: Facade, Repository, Strategy, Smart/Dumb Components
- SOLID principles aplicados ao Angular:
  - Single Responsibility (componente/service faz uma coisa)
  - Open/Closed (extensibilidade via composição)
  - Liskov Substitution (contratos com interfaces TS)
  - Interface Segregation (interfaces enxutas)
  - Dependency Inversion (`InjectionToken`, abstrações)
- Organização por feature, estrutura de pastas

### Projeto
- Instalar e configurar ESLint + Prettier
- Configurar Husky com hook de pre-commit (lint + format)
- Refatorar estrutura para feature-based
- Criar `SolicitacoesFacade` (Facade Pattern)
- Separar componentes em Smart (container) e Dumb (apresentação)
- Aplicar SRP: extrair lógica para services dedicados
- Criar `InjectionToken` para abstrair implementações
- Exercício de code review em dupla com checklist

---

## AULA 7 — OBSERVABILIDADE

### Temas
- Os 3 pilares: logs, métricas, traces
- Logging estruturado: serviço centralizado, níveis (debug, info, warn, error)
- Error Tracking com Sentry: setup, captura automática, source maps, breadcrumbs
- Session Replay com LogRocket: visão geral, quando usar, privacidade
- `ErrorHandler` customizado no Angular (captura global)
- HTTP Error Interceptor (centralizar tratamento de erros de API)
- Performance Monitoring (Sentry Performance, Web Vitals em produção)

### Projeto
- Criar `LoggerService` com output estruturado
- Implementar `GlobalErrorHandler` (extends `ErrorHandler`)
- Criar `ErrorInterceptor` para captura centralizada de erros HTTP
- Configurar Sentry (DSN de teste) e capturar primeiro erro
- Simular falhas na API e validar captura no dashboard
- Implementar toast/snackbar de notificação de erro ao usuário

---

## AULA 8 — CACHING STRATEGIES

### Temas
- Browser Storage: `localStorage`, `sessionStorage`, `IndexedDB` (quando usar cada um)
- Cache em memória com RxJS: `shareReplay`, `BehaviorSubject` como cache reativo
- Redis: conceito, arquitetura chave-valor, casos de uso no backend, como o frontend se beneficia
- HTTP Caching: headers `Cache-Control`, `ETag`, `Last-Modified`
- Stale-While-Revalidate: exibir dado antigo enquanto busca atualização
- Invalidação de cache: TTL, event-based, manual

### Projeto
- Criar `StorageService` genérico e tipado abstraindo `localStorage`
- Implementar cache em memória com `shareReplay`
- Implementar padrão cache-then-network (cache → atualiza da API em background)
- Configurar TTL e invalidação ao criar nova solicitação
- Comparar performance com/sem cache (DevTools Network)

---

## AULA 9 — REAL-TIME: WEBSOCKETS E SERVER-SENT EVENTS

### Temas
- Polling vs WebSocket vs SSE: trade-offs, quando usar cada um
- WebSockets: protocolo full-duplex, handshake, mensagens bidirecionais
- Server-Sent Events (SSE): comunicação unidirecional, reconexão automática nativa
- RxJS + WebSocket: `webSocket()` operator, retry, backoff exponencial
- Considerações de produção: heartbeat, timeout, reconexão

### Projeto
- Implementar polling simples com `interval` + `switchMap` (baseline)
- Criar `RealtimeService` com `rxjs/webSocket`
- Receber atualizações de status de solicitações em tempo real
- Implementar indicador visual "ao vivo" (badge pulsante)
- Implementar reconexão automática com backoff exponencial
- Demonstrar SSE com `EventSource` como alternativa unidirecional

---

## AULA 10 — INTERNACIONALIZAÇÃO E ACESSIBILIDADE

### Temas
- i18n vs l10n: internacionalização (estrutura) vs localização (tradução)
- `ngx-translate`: setup, `TranslateService`, arquivos JSON de tradução, pipe `translate`
- Pipes de locale: `DatePipe`, `CurrencyPipe`, `DecimalPipe` com locale dinâmico
- Acessibilidade (a11y): WCAG 2.1, níveis A/AA/AAA
- Semântica HTML: `<nav>`, `<main>`, `<button>` vs `<div>`
- ARIA: `role`, `aria-label`, `aria-live`, `aria-describedby`
- Navegação por teclado: `tabindex`, focus management, skip links
- Contraste e cores: ferramentas de verificação
- Angular CDK a11y: `FocusTrap`, `LiveAnnouncer`, `FocusMonitor`

### Projeto
- Instalar `@ngx-translate/core` + `@ngx-translate/http-loader`
- Criar traduções pt-BR e en-US
- Implementar seletor de idioma no header
- Formatar datas e valores monetários por locale
- Auditar projeto com Lighthouse Accessibility
- Corrigir semântica HTML
- Adicionar ARIA labels nos componentes
- Implementar navegação por teclado na lista

---

## AULA 11 — ACESSIBILIDADE AVANÇADA

### Temas
- Live regions: `aria-live="polite"` e `"assertive"`, anúncios dinâmicos
- Formulários acessíveis: labels associados, `aria-invalid`, mensagens de erro anunciadas
- Tabelas acessíveis: `<caption>`, `scope`, navegação por células
- Componentes customizados acessíveis: WAI-ARIA patterns (dropdown, modal, tabs)
- Angular CDK: `A11yModule`, `CdkTrapFocus`, `CdkAriaDescribedBy`
- Preferências do usuário: `prefers-reduced-motion`, `prefers-color-scheme`
- Testes automatizados de a11y: `axe-core`, `jest-axe`

### Projeto
- Implementar `LiveAnnouncer` para anunciar mudanças de status
- Tornar formulário de nova solicitação totalmente acessível
- Criar tabela acessível com `<caption>` e `scope`
- Implementar focus trap em modal de detalhes
- Adicionar suporte a `prefers-reduced-motion`
- Configurar `jest-axe` e criar testes automatizados de a11y
- Auditoria final: Lighthouse Accessibility score ≥ 95

---

## AULA 12 — PREPARAÇÃO PARA ENTREGA

### Temas
- Trade-offs técnicos
- Decisões de arquitetura
- Preparação para apresentação

### Projeto
- Organizar código final
- Preparar entrega/hackathon