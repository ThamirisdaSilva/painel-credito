

# AULA 11 — Central de Atividades em Tempo Real com Firebase Firestore

---

# ENTREGA DA AULA

Criar a tela:

```txt
/atividades
```

A tela deve exibir eventos da aplicação em tempo real.

Eventos registrados:

```txt
login
logout
criação de solicitação
edição de solicitação
aprovação de solicitação
recusa de solicitação
exclusão de solicitação
```

---

# MAPA DA AULA

PARTE 1 — Configurar Cloud Firestore no Firebase

PARTE 2 — Configurar regras do Firestore

PARTE 3 — Configurar Firestore no Angular

PARTE 4 — Criar modelo de atividade

PARTE 5 — Criar AtividadesService

PARTE 6 — Registrar atividade de login

PARTE 7 — Registrar atividade de logout

PARTE 8 — Registrar atividades nas solicitações

PARTE 9 — Criar tela /atividades

PARTE 10 — Adicionar rota protegida

PARTE 11 — Adicionar link no header

PARTE 12 — Teste inicial

PARTE 13 — Teste em tempo real com duas abas

PARTE 14 — Possíveis erros

---

# PARTE 1 — Configurar Cloud Firestore no Firebase

## 1.1 — Entrar no Firebase Console

Acessar:

```txt
https://console.firebase.google.com
```

Entrar no mesmo projeto usado na aula anterior.

---

## 1.2 — Acessar Firestore

No menu lateral esquerdo do Firebase, usar a busca ou procurar por:

```txt
Firestore
```

Selecionar:

```txt
Firestore
```

Não selecionar:

```txt
Realtime Database
```

---

## 1.3 — Criar banco de dados

Na tela do Firestore, clicar em:

```txt
Criar banco de dados
```

ou:

```txt
Create database
```

---

## 1.4 — Selecionar a edição do Firestore

Na tela **Selecionar a edição**, escolher:

```txt
Edição Standard
```

Clicar em:

```txt
Avançar
```

---

## 1.5 — Configurar ID e local do banco

Na etapa **ID e local do banco de dados**, manter o ID padrão:

```txt
(default)
```

Escolher a região sugerida pelo Firebase ou uma região disponível próxima.

Clicar em:

```txt
Avançar
```

---

## 1.6 — Escolher modo de segurança

Na etapa **Configurar**, selecionar:

```txt
Iniciar no modo de produção
```

ou:

```txt
Start in production mode
```

Clicar em:

```txt
Criar
```

---

# PARTE 2 — Configurar regras do Firestore

## 2.1 — Abrir regras

No Firestore, abrir a aba:

```txt
Rules
```

ou:

```txt
Regras
```

---

## 2.2 — Substituir regras

Substituir o conteúdo por:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /atividades/{atividadeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## 2.3 — Publicar regras

Clicar em:

```txt
Publicar
```

ou:

```txt
Publish
```

---

# PARTE 3 — Configurar Firestore no Angular

## 3.1 — Abrir app.config.ts

Arquivo:

```txt
src/app/app.config.ts
```

---

## 3.2 — Substituir o arquivo completo

```ts
import { ApplicationConfig, inject, LOCALE_ID, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { authInterceptor } from './interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { STORAGE_KEY } from './services/storage.token';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },

    {
      provide: STORAGE_KEY,
      useValue: 'solicitacoes',
    },

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),

    provideTranslateService({
      fallbackLang: 'pt-BR',
      lang: 'pt-BR',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://localhost:4000/graphql',
        }),
        cache: new InMemoryCache(),
      };
    }),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

---

# PARTE 4 — Criar modelo de atividade

## 4.1 — Criar arquivo

Criar:

```txt
src/app/models/atividade.model.ts
```

---

## 4.2 — Adicionar conteúdo

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
  | 'erro';

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

# PARTE 5 — Criar AtividadesService

## 5.1 — Criar arquivo

Criar:

```txt
src/app/services/atividades.service.ts
```

---

## 5.2 — Adicionar conteúdo

```ts
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
    const atividadesQuery = query(
      this.atividadesRef,
      orderBy('data', 'desc'),
      limit(30),
    );

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
```

---

# PARTE 6 — Registrar atividade de login

## 6.1 — Abrir arquivo

Arquivo:

```txt
src/app/components/login/login/login.ts
```

---

## 6.2 — Substituir o arquivo completo

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { AtividadesService } from '../../../services/atividades.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  email = '';
  senha = '';
  carregando = false;

  constructor(
    public authService: AuthService,
    private atividadesService: AtividadesService,
    private router: Router,
  ) {}

  async login() {
    this.carregando = true;

    const usuario = await this.authService.loginComEmailSenha(this.email, this.senha);

    this.carregando = false;

    if (usuario) {
      await this.atividadesService.registrarAtividade({
        tipo: 'login',
        descricao: `Login realizado com email e senha por ${usuario.email}`,
        entidade: 'usuario',
        entidadeId: usuario.uid,
      });

      this.router.navigate(['/solicitacoes']);
    }
  }

  async loginComGoogle() {
    this.carregando = true;

    const usuario = await this.authService.loginComGoogle();

    this.carregando = false;

    if (usuario) {
      await this.atividadesService.registrarAtividade({
        tipo: 'login',
        descricao: `Login realizado com Google por ${usuario.email}`,
        entidade: 'usuario',
        entidadeId: usuario.uid,
      });

      this.router.navigate(['/solicitacoes']);
    }
  }
}
```

---

# PARTE 7 — Registrar atividade de logout

## 7.1 — Ajustar HeaderComponent

Arquivo:

```txt
src/app/components/shared/header/header.ts
```

Substituir por:

```ts
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import { PreferencesService } from '../../../services/preferences.service';
import { AtividadesService } from '../../../services/atividades.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title = '';

  isOffline = !navigator.onLine;

  constructor(
    public authService: AuthService,
    public preferencesService: PreferencesService,
    private atividadesService: AtividadesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isOffline = !navigator.onLine;
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true;
  }

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false;
  }

  estaNaTelaLogin() {
    return this.router.url === '/login';
  }

  async logout() {
    await this.atividadesService.registrarAtividade({
      tipo: 'logout',
      descricao: 'Usuário saiu da aplicação',
      entidade: 'usuario',
    });

    await this.authService.logout();

    this.router.navigate(['/login']);
  }
}
```

---

## 7.2 — Ajustar PerfilUsuarioComponent

Arquivo:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.ts
```

Substituir por:

```ts
import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import { AppLanguage, AppTheme, PreferencesService } from '../../../services/preferences.service';
import { HeaderComponent } from '../../shared/header/header';
import { AtividadesService } from '../../../services/atividades.service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe, HeaderComponent],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.scss'],
})
export class PerfilUsuarioComponent {
  constructor(
    public authService: AuthService,
    public preferencesService: PreferencesService,
    private atividadesService: AtividadesService,
    private router: Router,
  ) {}

  alterarIdioma(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.preferencesService.alterarIdioma(select.value as AppLanguage);
  }

  alterarTema(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.preferencesService.alterarTema(select.value as AppTheme);
  }

  async sair() {
    await this.atividadesService.registrarAtividade({
      tipo: 'logout',
      descricao: 'Usuário saiu da aplicação pela tela de perfil',
      entidade: 'usuario',
    });

    await this.authService.logout();

    this.router.navigate(['/login']);
  }
}
```

---

# PARTE 8 — Registrar atividades nas solicitações

## 8.1 — Abrir facade

Arquivo:

```txt
src/app/services/solicitacoes.facade.ts
```

---

## 8.2 — Substituir arquivo completo

```ts
import { Injectable, signal, computed, effect } from '@angular/core';

import { SolicitacoesService, SolicitacaoViewModel } from './graphql.service';
import { StatusSolicitacao } from '../models/solicitacao.model';
import { AtividadesService } from './atividades.service';

@Injectable({ providedIn: 'root' })
export class SolicitacoesFacade {
  private filtroSelecionado = signal<string>('');
  private termoBusca = signal<string>('');
  private _solicitacoes = signal<SolicitacaoViewModel[]>([]);

  constructor(
    private service: SolicitacoesService,
    private atividadesService: AtividadesService,
  ) {
    effect(() => {
      const lista = this.service.solicitacoes();

      if (lista.length > 0) {
        this._solicitacoes.set(lista);
      } else {
        this.carregar();
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

  private atualizarLista(lista: SolicitacaoViewModel[]) {
    this._solicitacoes.set(lista);
    this.service.salvar(lista);
  }

  private aplicarStatusVisual(
    item: SolicitacaoViewModel,
  ): SolicitacaoViewModel {
    const status = item.status?.toLowerCase() ?? '';

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
      ...item,
      status: status as StatusSolicitacao,
      statusClass: classMap[status] ?? '',
      statusLabel: labelMap[status] ?? item.statusLabel,
    };
  }

  atualizarStatus(id: number | string, status: StatusSolicitacao) {
    const solicitacaoAntesDaAtualizacao = this._solicitacoes().find(
      (item) => String(item.id) === String(id),
    );

    const lista = this._solicitacoes().map((item) => {
      if (String(item.id) !== String(id)) {
        return item;
      }

      return this.aplicarStatusVisual({
        ...item,
        status,
      });
    });

    this.atualizarLista(lista);

    if (!solicitacaoAntesDaAtualizacao) {
      return;
    }

    const tipo = status === 'aprovado' ? 'aprovacao' : 'recusa';

    const descricao =
      status === 'aprovado'
        ? `Solicitação de ${solicitacaoAntesDaAtualizacao.cliente} foi aprovada`
        : `Solicitação de ${solicitacaoAntesDaAtualizacao.cliente} foi recusada`;

    void this.atividadesService.registrarAtividade({
      tipo,
      descricao,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  criar(novo: SolicitacaoViewModel) {
    const novaSolicitacao = this.aplicarStatusVisual(novo);

    const atual = this.service.getDadosPersistidos();
    const lista = [...atual, novaSolicitacao];

    this.atualizarLista(lista);

    void this.atividadesService.registrarAtividade({
      tipo: 'criacao',
      descricao: `Nova solicitação criada para ${novaSolicitacao.cliente}`,
      entidade: 'solicitacao',
      entidadeId: novaSolicitacao.id,
    });
  }

  editar(id: number | string, atualizado: SolicitacaoViewModel) {
    const solicitacaoAtualizada = this.aplicarStatusVisual(atualizado);

    const atual = this.service.getDadosPersistidos();

    const lista = atual.map((item) =>
      String(item.id) === String(id) ? solicitacaoAtualizada : item,
    );

    this.atualizarLista(lista);

    void this.atividadesService.registrarAtividade({
      tipo: 'edicao',
      descricao: `Solicitação de ${solicitacaoAtualizada.cliente} foi editada`,
      entidade: 'solicitacao',
      entidadeId: id,
    });
  }

  deletar(id: number | string) {
    const atual = this.service.getDadosPersistidos();

    const solicitacao = atual.find((item) => String(item.id) === String(id));

    const lista = atual.filter((item) => String(item.id) !== String(id));

    this.atualizarLista(lista);

    if (!solicitacao) {
      return;
    }

    void this.atividadesService.registrarAtividade({
      tipo: 'exclusao',
      descricao: `Solicitação de ${solicitacao.cliente} foi excluída`,
      entidade: 'solicitacao',
      entidadeId: solicitacao.id,
    });
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

# PARTE 9 — Criar tela /atividades

## 9.1 — Gerar componente

Rodar:

```bash
ng generate component components/atividades/atividades-lista --standalone
```

---

## 9.2 — Arquivos criados

```txt
src/app/components/atividades/atividades-lista/atividades-lista.ts
src/app/components/atividades/atividades-lista/atividades-lista.html
src/app/components/atividades/atividades-lista/atividades-lista.scss
```

---

## 9.3 — Ajustar AtividadesListaComponent

Arquivo:

```txt
src/app/components/atividades/atividades-lista/atividades-lista.ts
```

Substituir por:

```ts
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AtividadesService } from '../../../services/atividades.service';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-atividades-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, HeaderComponent],
  templateUrl: './atividades-lista.html',
  styleUrl: './atividades-lista.scss',
})
export class AtividadesListaComponent {
  private atividadesService = inject(AtividadesService);

  atividades$ = this.atividadesService.listarAtividades();

  getIcone(tipo: string) {
    const icones: Record<string, string> = {
      login: '🔐',
      logout: '🚪',
      criacao: '📝',
      edicao: '✏️',
      aprovacao: '✅',
      recusa: '❌',
      exclusao: '🗑️',
      tema: '🌙',
      idioma: '🌐',
      erro: '⚠️',
    };

    return icones[tipo] ?? '📌';
  }

  getTitulo(tipo: string) {
    const titulos: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      criacao: 'Criação',
      edicao: 'Edição',
      aprovacao: 'Aprovação',
      recusa: 'Recusa',
      exclusao: 'Exclusão',
      tema: 'Tema',
      idioma: 'Idioma',
      erro: 'Erro',
    };

    return titulos[tipo] ?? 'Atividade';
  }
}
```

---

## 9.4 — Ajustar HTML

Arquivo:

```txt
src/app/components/atividades/atividades-lista/atividades-lista.html
```

Substituir por:

```html
<app-header title="Central de Atividades"></app-header>

<main class="atividades-page">
  <section class="atividades-hero">
    <div>
      <p class="eyebrow">Tempo real com Firebase Firestore</p>

      <h2>Eventos recentes da aplicação</h2>

      <p>
        Acompanhe logins, alterações de solicitações e mudanças de preferências
        registradas automaticamente pelo sistema.
      </p>
    </div>

    <a class="btn-voltar" routerLink="/solicitacoes">
      Voltar para solicitações
    </a>
  </section>

  <section class="live-card" aria-live="polite">
    <span class="live-dot" aria-hidden="true"></span>
    Atualizações em tempo real ativadas
  </section>

  @if (atividades$ | async; as atividades) {
    @if (atividades.length > 0) {
      <section class="timeline" aria-label="Lista de atividades recentes">
        @for (atividade of atividades; track atividade.id) {
          <article class="atividade-card">
            <div class="atividade-card__icone" aria-hidden="true">
              {{ getIcone(atividade.tipo) }}
            </div>

            <div class="atividade-card__conteudo">
              <div class="atividade-card__topo">
                <h3>
                  {{ getTitulo(atividade.tipo) }}
                </h3>

                @if (atividade.data?.toDate) {
                  <time>
                    {{ atividade.data.toDate() | date:'dd/MM/yyyy HH:mm:ss' }}
                  </time>
                }
              </div>

              <p class="atividade-card__descricao">
                {{ atividade.descricao }}
              </p>

              <div class="atividade-card__usuario">
                @if (atividade.usuarioFoto) {
                  <img
                    [src]="atividade.usuarioFoto"
                    alt=""
                    aria-hidden="true"
                  />
                }

                <span>
                  {{ atividade.usuarioNome || atividade.usuarioEmail || 'Usuário não identificado' }}
                </span>

                @if (atividade.usuarioEmail) {
                  <small>
                    {{ atividade.usuarioEmail }}
                  </small>
                }
              </div>
            </div>
          </article>
        }
      </section>
    } @else {
      <p class="empty">
        Nenhuma atividade registrada ainda.
      </p>
    }
  } @else {
    <p class="loading">
      Carregando atividades...
    </p>
  }
</main>
```

---

## 9.5 — Ajustar SCSS

Arquivo:

```txt
src/app/components/atividades/atividades-lista/atividades-lista.scss
```

Substituir por:

```scss
:host {
  display: block;
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-main);
}

.atividades-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.atividades-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: #6366f1;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.atividades-hero h2 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  color: var(--text-main);
}

.atividades-hero p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.btn-voltar {
  flex-shrink: 0;
  text-decoration: none;
  background: #1e3a8a;
  color: #ffffff;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-weight: 700;
}

.btn-voltar:hover {
  background: #1d4ed8;
}

.btn-voltar:focus {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}

.live-card {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
  border: 1px solid rgba(22, 163, 74, 0.25);
  border-radius: 999px;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
}

.live-dot {
  width: 10px;
  height: 10px;
  background: #16a34a;
  border-radius: 50%;
  box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.15);
}

.timeline {
  display: grid;
  gap: 1rem;
}

.atividade-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.atividade-card__icone {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--hover-bg);
  font-size: 1.4rem;
}

.atividade-card__topo {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.atividade-card__topo h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 1rem;
}

.atividade-card__topo time {
  color: var(--text-muted);
  font-size: 0.82rem;
  white-space: nowrap;
}

.atividade-card__descricao {
  margin: 0.4rem 0 0.8rem;
  color: var(--text-main);
  line-height: 1.5;
}

.atividade-card__usuario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.atividade-card__usuario img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.atividade-card__usuario small {
  color: var(--text-muted);
}

.empty,
.loading {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .atividades-page {
    padding: 1rem;
  }

  .atividades-hero {
    flex-direction: column;
  }

  .atividade-card {
    grid-template-columns: 1fr;
  }

  .atividade-card__topo {
    flex-direction: column;
  }
}
```

---

# PARTE 10 — Adicionar rota protegida

## 10.1 — Abrir app.routes.ts

Arquivo:

```txt
src/app/app.routes.ts
```

---

## 10.2 — Substituir o arquivo completo

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
    loadComponent: () => import('./components/login/login/login').then((m) => m.LoginComponent),
  },

  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista').then(
        (m) => m.SolicitacaoListaComponent,
      ),
    canActivate: [authGuard],
  },

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
    path: 'solicitacoes/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe').then(
        (m) => m.SolicitacaoDetalheComponent,
      ),
    canActivate: [authGuard],
  },
];
```

---

# PARTE 11 — Adicionar link no header

## 11.1 — Abrir header.html

Arquivo:

```txt
src/app/components/shared/header/header.html
```

---

## 11.2 — Substituir o arquivo completo

```html
<header class="header">
  @if (isOffline) {
    <div class="offline-banner">
      Você está navegando sem internet. Verifique sua conexão.
    </div>
  }

  <div class="header__container">
    <div>
      <h1 class="header__title">
        {{ title }}
      </h1>

      <p class="header__subtitle">
        {{ 'APP.TITLE' | translate }}
      </p>
    </div>

    @if (authService.usuario() && !estaNaTelaLogin()) {
      <div class="header__auth">
        <a class="header__link" routerLink="/solicitacoes">
          {{ 'ACTIONS.REQUESTS' | translate }}
        </a>

        <a class="header__link" routerLink="/perfil">
          {{ 'ACTIONS.PROFILE' | translate }}
        </a>

        <a class="header__link" routerLink="/atividades">
          Atividades
        </a>

        <button type="button" class="header__logout" (click)="logout()">
          {{ 'ACTIONS.LOGOUT' | translate }}
        </button>
      </div>
    }
  </div>
</header>
```

---

# PARTE 12 — Teste inicial

## 12.1 — Rodar aplicação

```bash
npm start
```

ou:

```bash
ng serve
```

---

## 12.2 — Abrir aplicação

Acessar:

```txt
http://localhost:4200/login
```

---

## 12.3 — Fazer login

Fazer login com:

```txt
email/senha
```

ou:

```txt
Google
```

---

## 12.4 — Abrir Firebase Console

Acessar:

```txt
https://console.firebase.google.com
```

---

## 12.5 — Abrir Firestore

Acessar:

```txt
Firestore
Dados
```

---

## 12.6 — Conferir coleção

Procurar a coleção:

```txt
atividades
```

---

## 12.7 — Conferir documento

Abrir o documento criado automaticamente.

Conferir campos:

```txt
tipo
descricao
entidade
entidadeId
usuarioEmail
usuarioNome
usuarioFoto
data
```

---

## 12.8 — Abrir tela de atividades

Acessar:

```txt
http://localhost:4200/atividades
```

---

## 12.9 — Conferir atividade de login

Verificar se aparece o evento de login.

---

# PARTE 13 — Teste em tempo real com duas abas

## 13.1 — Abrir primeira aba

Acessar:

```txt
http://localhost:4200/atividades
```

---

## 13.2 — Abrir segunda aba

Acessar:

```txt
http://localhost:4200/solicitacoes
```

---

## 13.3 — Aprovar solicitação

Na aba `/solicitacoes`, aprovar uma solicitação.

---

## 13.4 — Conferir atualização

Voltar para a aba `/atividades`.

Verificar se apareceu uma nova atividade.

---

## 13.5 — Recusar solicitação

Na aba `/solicitacoes`, recusar uma solicitação.

---

## 13.6 — Conferir atualização

Voltar para `/atividades`.

Verificar se apareceu uma nova atividade.

---

## 13.7 — Criar solicitação

Criar uma nova solicitação.

---

## 13.8 — Conferir atualização

Abrir `/atividades`.

Verificar se apareceu o evento de criação.

---

## 13.9 — Editar solicitação

Editar uma solicitação.

---

## 13.10 — Conferir atualização

Abrir `/atividades`.

Verificar se apareceu o evento de edição.

---

## 13.11 — Excluir solicitação

Excluir uma solicitação.

---

## 13.12 — Conferir atualização

Abrir `/atividades`.

Verificar se apareceu o evento de exclusão.

---

## 13.13 — Fazer logout

Clicar em:

```txt
Sair
```

---

## 13.14 — Conferir logout no Firestore

Abrir:

```txt
Firestore
Dados
atividades
```

Verificar documento com:

```txt
tipo: "logout"
```

---

# PARTE 14 — Possíveis erros

## 14.1 — Missing or insufficient permissions

Verificar:

```txt
usuário está logado
regras foram publicadas
coleção se chama atividades
registro de logout acontece antes do logout
```

---

## 14.2 — No provider for Firestore

Verificar em:

```txt
src/app/app.config.ts
```

Se existe:

```ts
provideFirestore(() => getFirestore()),
```

E o import:

```ts
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
```

---

## 14.3 — Atividade não aparece na tela

Verificar:

```txt
rota /atividades foi criada
AtividadesListaComponent foi criado
AtividadesService está retornando listarAtividades()
Firestore tem documentos na coleção atividades
usuário está logado
```

---

## 14.4 — Atividade aparece sem data

Verificar no HTML:

```html
@if (atividade.data?.toDate) {
  <time>
    {{ atividade.data.toDate() | date:'dd/MM/yyyy HH:mm:ss' }}
  </time>
}
```

---

## 14.5 — Logout não registra atividade

Verificar se o registro está antes do logout:

```ts
await this.atividadesService.registrarAtividade(...);
await this.authService.logout();
```

---

# CHECKLIST FINAL

```txt
[ ] Firestore criado
[ ] Regras publicadas
[ ] provideFirestore adicionado
[ ] atividade.model.ts criado
[ ] AtividadesService criado
[ ] login registra atividade
[ ] logout registra atividade
[ ] criação registra atividade
[ ] edição registra atividade
[ ] aprovação registra atividade
[ ] recusa registra atividade
[ ] exclusão registra atividade
[ ] componente /atividades criado
[ ] rota /atividades criada
[ ] link Atividades adicionado no header
[ ] tela /atividades exibe dados
[ ] teste com duas abas funcionando
[ ] Firestore recebe documentos
[ ] console sem erro de permissão
```
