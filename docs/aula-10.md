# Aula 10 — Passo a passo dos alunos

## Qualidade de Aplicação: Login Real, Perfil, Preferências, Validação, Performance, i18n e Acessibilidade

---

## 1. Ajuste inicial do projeto

### 1.1. Abrir o arquivo

```txt
src/app/app.config.ts
```

### 1.2. Remover duplicações do Service Worker

Deixe apenas uma chamada de `provideServiceWorker` no array de `providers`.

```ts
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
}),
```

### 1.3. Conferir o `app.config.ts` inicial

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

## 2. Validação do formulário de solicitação

### 2.1. Abrir os arquivos

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.ts
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.html
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.scss
```

### 2.2. Substituir o componente TypeScript

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.ts
```

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
  styleUrls: ['./solicitacao-form.scss'],
})
export class SolicitacaoFormComponent implements OnInit {
  cliente = '';
  documento = '';
  valor: number = 0;

  modoEdicao = false;
  idEdicao: number | null = null;

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

  apenasNumeros(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.documento = input.value;
  }

  salvar() {
    this.nomeInvalido = this.cliente.trim() === '';
    this.cpfInvalido = !/^\d{11}$/.test(this.documento);

    if (this.nomeInvalido || this.cpfInvalido) {
      return;
    }

    if (this.modoEdicao && this.idEdicao) {
      this.facade.editar(this.idEdicao, {
        id: this.idEdicao,
        cliente: this.cliente.trim(),
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: '',
      });
    } else {
      this.facade.criar({
        id: Date.now(),
        cliente: this.cliente.trim(),
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: '',
      });
    }

    this.router.navigate(['/solicitacoes']);
  }

  cancelar() {
    this.router.navigate(['/solicitacoes']);
  }
}
```

### 2.3. Substituir o HTML do formulário

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.html
```

```html
<div class="form-container">
  <h2>{{ modoEdicao ? 'Editar Solicitação' : 'Nova Solicitação' }}</h2>

  <form (ngSubmit)="salvar()" novalidate>
    <label for="cliente">Nome do cliente</label>
    <input
      id="cliente"
      type="text"
      [(ngModel)]="cliente"
      name="cliente"
      placeholder="Digite o nome do cliente"
      [attr.aria-invalid]="nomeInvalido"
      aria-describedby="erro-cliente"
    />

    @if (nomeInvalido) {
      <small id="erro-cliente" class="erro" aria-live="polite">
        Nome é obrigatório.
      </small>
    }

    <label for="documento">CPF</label>
    <input
      id="documento"
      type="text"
      [(ngModel)]="documento"
      name="documento"
      placeholder="Digite somente os 11 números do CPF"
      maxlength="11"
      inputmode="numeric"
      (input)="apenasNumeros($event)"
      [attr.aria-invalid]="cpfInvalido"
      aria-describedby="erro-documento"
    />

    @if (cpfInvalido) {
      <small id="erro-documento" class="erro" aria-live="polite">
        CPF deve conter exatamente 11 números.
      </small>
    }

    <label for="valor">Valor solicitado</label>
    <input
      id="valor"
      type="number"
      [(ngModel)]="valor"
      name="valor"
      placeholder="Digite o valor solicitado"
    />

    <div class="form-acoes">
      <button class="btn-salvar" type="submit">
        Salvar
      </button>

      <button class="btn-cancelar" type="button" (click)="cancelar()">
        Cancelar
      </button>
    </div>
  </form>
</div>
```

### 2.4. Adicionar estilos de validação

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.scss
```

Adicionar ao final:

```scss
label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.erro {
  margin-top: -0.5rem;
  font-size: 0.8rem;
  color: #b91c1c;
}

input[aria-invalid='true'] {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.btn-salvar:focus,
.btn-cancelar:focus,
input:focus {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}
```

### 2.5. Testar a validação

```txt
1. Abrir /solicitacoes/nova
2. Clicar em Salvar sem preencher nome
3. Verificar mensagem "Nome é obrigatório"
4. Digitar CPF com letras
5. Verificar se letras são removidas
6. Digitar CPF com menos de 11 números
7. Clicar em Salvar
8. Verificar mensagem de erro
9. Digitar CPF com 11 números
10. Salvar
```

---

## 3. Configurar Firebase Authentication

### 3.1. Verificar a versão do Angular

Rodar um dos comandos:

```bash
npm list @angular/core
```

ou:

```bash
ng version
```

### 3.2. Instalar Firebase e AngularFire

Para Angular 19:

```bash
npm install firebase@11 @angular/fire@19 --legacy-peer-deps
```

Para Angular 20:

```bash
npm install firebase@11 @angular/fire@20 --legacy-peer-deps
```

### 3.3. Se instalar errado

Remover:

```bash
npm uninstall @angular/fire firebase
```

Instalar novamente com a versão correta.

Angular 19:

```bash
npm install firebase@11 @angular/fire@19 --legacy-peer-deps
```

Angular 20:

```bash
npm install firebase@11 @angular/fire@20 --legacy-peer-deps
```

### 3.4. Se o projeto ficar com dependências inconsistentes

No Mac ou Linux:

```bash
rm -rf node_modules package-lock.json
npm install
```

No Windows, apagar manualmente:

```txt
node_modules
package-lock.json
```

Depois rodar:

```bash
npm install
```

### 3.5. Criar o projeto no Firebase Console

Acessar:

```txt
https://console.firebase.google.com
```

Executar:

```txt
1. Clicar em Adicionar projeto
2. Usar o nome painel-credito
3. Desativar Google Analytics para esta aula, se aparecer a opção
4. Clicar em Criar projeto
```

### 3.6. Adicionar um app web no Firebase

No projeto criado:

```txt
1. Clicar em + Adicionar app
2. Escolher a opção Web: </>
3. Nome sugerido: painel-credito-web
4. Deixar Firebase Hosting desmarcado
5. Clicar em Registrar app
```

### 3.7. Copiar a configuração do Firebase

Copiar apenas o objeto:

```ts
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
};
```

### 3.8. Criar o arquivo de ambiente

Criar a pasta:

```txt
src/environments
```

Criar o arquivo:

```txt
src/environments/environment.ts
```

Conteúdo:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJECT_ID',
    storageBucket: 'SEU_PROJETO.firebasestorage.app',
    messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
    appId: 'SEU_APP_ID',
  },
};
```

### 3.9. Configurar Firebase no Angular

Arquivo:

```txt
src/app/app.config.ts
```

Adicionar imports:

```ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
```

Adicionar no array de `providers`:

```ts
provideFirebaseApp(() => initializeApp(environment.firebase)),

provideAuth(() => getAuth()),
```

Exemplo completo:

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
import { environment } from '../environments/environment';

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

### 3.10. Habilitar Authentication no Firebase

No Firebase Console:

```txt
1. Abrir o projeto painel-credito
2. Acessar Segurança > Authentication
3. Clicar em Primeiros passos
4. Abrir a aba Método de login
5. Habilitar Email/Password
6. Habilitar Google
7. Informar o email de suporte, se solicitado
8. Salvar
```

### 3.11. Conferir domínios autorizados

Em Authentication:

```txt
1. Abrir Configurações
2. Localizar Domínios autorizados
3. Confirmar se localhost está listado
4. Se não estiver, adicionar localhost
```

### 3.12. Criar usuário de teste

Em Authentication > Usuários:

```txt
1. Clicar em Adicionar usuário
2. Criar um usuário de teste
```

Sugestão para aula:

```txt
email: teste@teste.com
senha: 123456
```

---

## 4. Atualizar o AuthService

### 4.1. Abrir o arquivo

```txt
src/app/services/auth.service.ts
```

### 4.2. Substituir o conteúdo

```ts
import { Injectable, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';

export type LoginProvider = 'email' | 'google';

export interface AccessInfo {
  date: string;
  provider: LoginProvider;
  email: string | null;
  userAgent: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  usuario = signal<User | null>(null);
  carregando = signal(true);
  erro = signal<string | null>(null);
  ultimoAcesso = signal<AccessInfo | null>(null);

  isAuthenticated = signal(false);

  private accessStorageKey = 'ultimo_acesso';

  constructor(private auth: Auth) {
    const acessoSalvo = localStorage.getItem(this.accessStorageKey);

    if (acessoSalvo) {
      this.ultimoAcesso.set(JSON.parse(acessoSalvo));
    }

    onAuthStateChanged(this.auth, (user) => {
      this.usuario.set(user);
      this.isAuthenticated.set(!!user);
      this.carregando.set(false);
    });
  }

  async loginComEmailSenha(email: string, senha: string) {
    this.erro.set(null);

    try {
      const credencial = await signInWithEmailAndPassword(this.auth, email, senha);

      this.usuario.set(credencial.user);
      this.isAuthenticated.set(true);
      this.registrarAcesso('email', credencial.user.email);

      return credencial.user;
    } catch {
      this.erro.set('Não foi possível entrar. Verifique email e senha.');
      this.isAuthenticated.set(false);
      return null;
    }
  }

  async loginComGoogle() {
    this.erro.set(null);

    try {
      const provider = new GoogleAuthProvider();
      const credencial = await signInWithPopup(this.auth, provider);

      this.usuario.set(credencial.user);
      this.isAuthenticated.set(true);
      this.registrarAcesso('google', credencial.user.email);

      return credencial.user;
    } catch {
      this.erro.set('Não foi possível entrar com Google.');
      this.isAuthenticated.set(false);
      return null;
    }
  }

  async logout() {
    await signOut(this.auth);

    this.usuario.set(null);
    this.isAuthenticated.set(false);
  }

  estaLogado() {
    return this.usuario() !== null;
  }

  async getToken() {
    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken();
  }

  private registrarAcesso(provider: LoginProvider, email: string | null) {
    const acesso: AccessInfo = {
      date: new Date().toISOString(),
      provider,
      email,
      userAgent: navigator.userAgent,
    };

    this.ultimoAcesso.set(acesso);
    localStorage.setItem(this.accessStorageKey, JSON.stringify(acesso));
  }
}
```

### 4.3. Testar a configuração

Rodar:

```bash
npm start
```

ou:

```bash
ng serve
```

Conferir:

```txt
1. O projeto sobe sem erro
2. O environment.ts é encontrado
3. O @angular/fire foi instalado corretamente
4. O AuthService compila
```

---

## 5. Tela de login

### 5.1. Abrir os arquivos

```txt
src/app/components/login/login/login.ts
src/app/components/login/login/login.html
src/app/components/login/login/login.scss
```

### 5.2. Atualizar o componente

Arquivo:

```txt
src/app/components/login/login/login.ts
```

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

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
    private router: Router,
  ) {}

  async login() {
    this.carregando = true;

    const usuario = await this.authService.loginComEmailSenha(this.email, this.senha);

    this.carregando = false;

    if (usuario) {
      this.router.navigate(['/solicitacoes']);
    }
  }

  async loginComGoogle() {
    this.carregando = true;

    const usuario = await this.authService.loginComGoogle();

    this.carregando = false;

    if (usuario) {
      this.router.navigate(['/solicitacoes']);
    }
  }
}
```

### 5.3. Atualizar o HTML

Arquivo:

```txt
src/app/components/login/login/login.html
```

```html
<div class="login">
  <div class="login__container">
    <div class="login__card">
      <h2>Acesso</h2>

      <form class="login__form" (ngSubmit)="login()" novalidate>
        <label class="login__label" for="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Digite seu email"
          class="login__input"
          [(ngModel)]="email"
          autocomplete="email"
        />

        <label class="login__label" for="senha">Senha</label>
        <input
          id="senha"
          type="password"
          name="senha"
          placeholder="Digite sua senha"
          class="login__input"
          [(ngModel)]="senha"
          autocomplete="current-password"
        />

        @if (authService.erro()) {
          <p class="login__error" aria-live="polite">
            {{ authService.erro() }}
          </p>
        }

        <button class="login__button" type="submit" [disabled]="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>

        <button
          class="login__button login__button--google"
          type="button"
          (click)="loginComGoogle()"
          [disabled]="carregando"
        >
          Entrar com Google
        </button>
      </form>

      <p class="login__footer">
        Ambiente interno • Uso corporativo
      </p>
    </div>
  </div>
</div>
```

---

## 6. Guard, logout e header

### 6.1. Atualizar o Auth Guard

Arquivo:

```txt
src/app/guards/auth.guard.ts
```

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['/login']);
    }),
  );
};
```

### 6.2. Atualizar o HeaderComponent

Arquivo:

```txt
src/app/components/shared/header/header.ts
```

```ts
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title = '';

  isOffline = !navigator.onLine;

  constructor(
    public authService: AuthService,
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
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

### 6.3. Atualizar o HTML do header

Arquivo:

```txt
src/app/components/shared/header/header.html
```

```html
<header class="header">
  @if (isOffline) {
    <div class="offline-banner">
      Você está navegando sem internet. Verifique sua conexão.
    </div>
  }

  <div class="header__container">
    <div>
      <h1 class="header__title">{{ title }}</h1>

      <p class="header__subtitle">
        Gerencie e acompanhe as solicitações de crédito
      </p>
    </div>

    @if (authService.usuario() && !estaNaTelaLogin()) {
      <div class="header__auth">
        <button type="button" class="header__logout" (click)="logout()">
          Sair
        </button>
      </div>
    }
  </div>
</header>
```

### 6.4. Atualizar o SCSS do header

Arquivo:

```txt
src/app/components/shared/header/header.scss
```

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

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: #94a3b8;
    margin: 0;
  }

  &__auth {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__link {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    line-height: 1;
    padding: 0.6rem 0;
  }

  &__link:hover {
    text-decoration: underline;
  }

  &__link:focus {
    outline: 3px solid rgba(255, 255, 255, 0.55);
    outline-offset: 2px;
    border-radius: 6px;
  }

  &__logout {
    border: none;
    border-radius: 10px;
    padding: 0.65rem 1rem;
    background: #1e3a8a;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  &__logout:hover {
    background: #dc2626;
  }

  &__logout:focus {
    outline: 3px solid rgba(99, 102, 241, 0.35);
    outline-offset: 2px;
  }
}

.offline-banner {
  background-color: #ff9800;
  color: #ffffff;
  text-align: center;
  padding: 10px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .header {
    &__container {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    &__auth {
      width: 100%;
      gap: 0.75rem;
    }

    &__logout {
      margin-left: auto;
    }
  }
}
```

### 6.5. Testar o guard

```txt
1. Abrir /solicitacoes sem estar logado
2. Verificar se redireciona para /login
3. Fazer login com email e senha ou Google
4. Verificar se entra em /solicitacoes
5. Atualizar a página
6. Verificar se continua logado
7. Clicar em Sair
8. Verificar se volta para /login
9. Tentar acessar /solicitacoes manualmente
10. Confirmar que volta para /login
```

---

## 7. Criar perfil e preferências

### 7.1. Gerar o componente de perfil

```bash
ng generate component components/perfil/perfil-usuario --standalone
```

Arquivos criados:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.ts
src/app/components/perfil/perfil-usuario/perfil-usuario.html
src/app/components/perfil/perfil-usuario/perfil-usuario.scss
```

### 7.2. Configurar rota de perfil

Arquivo:

```txt
src/app/app.routes.ts
```

Adicionar:

```ts
{
  path: 'perfil',
  loadComponent: () =>
    import('./components/perfil/perfil-usuario/perfil-usuario').then(
      (m) => m.PerfilUsuarioComponent,
    ),
  canActivate: [authGuard],
},
```

### 7.3. Conferir exemplo de rotas

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
    path: 'solicitacoes/:id',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe').then(
        (m) => m.SolicitacaoDetalheComponent,
      ),
    canActivate: [authGuard],
  },
];
```

### 7.4. Criar o PreferencesService

Criar arquivo:

```txt
src/app/services/preferences.service.ts
```

```ts
import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'pt-BR' | 'en-US';

export interface UserPreferences {
  theme: AppTheme;
  language: AppLanguage;
}

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private storageKey = 'user_preferences';

  preferences = signal<UserPreferences>({
    theme: 'light',
    language: 'pt-BR',
  });

  constructor(private translate: TranslateService) {
    this.carregarPreferencias();

    this.translate.use(this.preferences().language);
    this.aplicarTema(this.preferences().theme);
  }

  alterarIdioma(language: AppLanguage) {
    const atual = this.preferences();

    this.preferences.set({
      ...atual,
      language,
    });

    this.translate.use(language);
    this.salvar();
  }

  alterarTema(theme: AppTheme) {
    const atual = this.preferences();

    this.preferences.set({
      ...atual,
      theme,
    });

    this.aplicarTema(theme);
    this.salvar();
  }

  private carregarPreferencias() {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as UserPreferences;

      const theme: AppTheme = parsed.theme === 'dark' ? 'dark' : 'light';

      const language: AppLanguage =
        parsed.language === 'en-US' ? 'en-US' : 'pt-BR';

      this.preferences.set({
        theme,
        language,
      });
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private salvar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.preferences()));
  }

  private aplicarTema(theme: AppTheme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }
}
```

### 7.5. Atualizar o componente de perfil

Arquivo:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.ts
```

```ts
import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import {
  AppLanguage,
  AppTheme,
  PreferencesService,
} from '../../../services/preferences.service';
import { HeaderComponent } from '../../shared/header/header';

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
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

### 7.6. Atualizar o HTML de perfil

Arquivo:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.html
```

```html
<app-header title="Perfil e Configurações"></app-header>

<main class="perfil">
  <section class="perfil-card" aria-labelledby="titulo-perfil">
    <div class="perfil-card__header">
      @if (authService.usuario()?.photoURL) {
        <img
          class="perfil-card__foto"
          [src]="authService.usuario()?.photoURL"
          alt="Foto do usuário logado"
        />
      } @else {
        <div class="perfil-card__avatar" aria-hidden="true">
          {{ authService.usuario()?.email?.charAt(0)?.toUpperCase() }}
        </div>
      }

      <div>
        <h2 id="titulo-perfil">
          {{ authService.usuario()?.displayName || 'Usuário logado' }}
        </h2>

        <p>
          {{ authService.usuario()?.email }}
        </p>
      </div>
    </div>

    <div class="perfil-card__info">
      <p>
        <strong>Provedor:</strong>
        {{ authService.usuario()?.providerData?.[0]?.providerId || 'email/senha' }}
      </p>

      @if (authService.ultimoAcesso()) {
        <p>
          <strong>Último acesso:</strong>
          {{ authService.ultimoAcesso()?.date | date: 'dd/MM/yyyy HH:mm' }}
        </p>

        <p>
          <strong>Tipo de login:</strong>
          {{ authService.ultimoAcesso()?.provider }}
        </p>
      }
    </div>
  </section>

  <section class="preferencias-card" aria-labelledby="titulo-preferencias">
    <h2 id="titulo-preferencias">
      Preferências
    </h2>

    <div class="campo">
      <label for="idioma">
        Idioma
      </label>

      <select
        id="idioma"
        [value]="preferencesService.preferences().language"
        (change)="alterarIdioma($event)"
      >
        <option value="pt-BR">Português</option>
        <option value="en-US">English</option>
      </select>
    </div>

    <div class="campo">
      <label for="tema">
        Tema
      </label>

      <select
        id="tema"
        [value]="preferencesService.preferences().theme"
        (change)="alterarTema($event)"
      >
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </div>
  </section>

  <section class="seguranca-card" aria-labelledby="titulo-seguranca">
    <h2 id="titulo-seguranca">
      Segurança
    </h2>

    <p>
      Nesta versão, o sistema registra o último acesso com data, email, provedor e navegador.
    </p>

    <p>
      Em uma aplicação real, informações como IP, localização aproximada e auditoria completa
      devem ser registradas no backend.
    </p>

    <button type="button" class="btn-sair" (click)="sair()">
      Sair da conta
    </button>
  </section>
</main>
```

### 7.7. Atualizar o SCSS do perfil

Arquivo:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.scss
```

```scss
:host {
  display: block;
  min-height: 100vh;
  background: var(--page-bg);
}

.perfil {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.perfil-card,
.preferencias-card,
.seguranca-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.perfil-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.perfil-card__foto,
.perfil-card__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
}

.perfil-card__foto {
  object-fit: cover;
}

.perfil-card__avatar {
  display: grid;
  place-items: center;
  background: #2563eb;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
}

.perfil-card h2,
.preferencias-card h2,
.seguranca-card h2 {
  margin: 0 0 0.75rem;
  color: var(--text-main);
}

.perfil-card p,
.preferencias-card p,
.seguranca-card p {
  color: var(--text-muted);
}

.perfil-card__info {
  margin-top: 1.5rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1rem;
}

label {
  font-weight: 600;
  color: var(--text-main);
}

select {
  max-width: 260px;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-main);
}

select:focus,
button:focus {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}

.btn-sair {
  margin-top: 1rem;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  background: #dc2626;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.btn-sair:hover {
  background: #b91c1c;
}
```

---

## 8. Tema claro e escuro

### 8.1. Atualizar estilos globais

Arquivo:

```txt
src/styles.scss
```

Adicionar:

```scss
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

body {
  margin: 0;
  background: var(--page-bg);
  color: var(--text-main);
  font-family: Arial, sans-serif;
}

button,
input,
select {
  font-family: inherit;
}
```

### 8.2. Atualizar a lista de solicitações para usar variáveis

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.scss
```

```scss
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--page-bg);
  color: var(--text-main);
  min-height: 100vh;
}

app-resumo-solicitacoes {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.top-bar .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-bar .right {
  display: flex;
  align-items: center;
}

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

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
  margin-top: 16px;
}

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

.empty {
  text-align: center;
  padding: 4rem 0;
}

.empty__text {
  color: var(--text-muted);
  font-size: 1rem;
}

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

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

### 8.3. Testar tema

```txt
1. Fazer login
2. Abrir /perfil
3. Localizar a seção Preferências
4. No campo Tema, escolher Escuro
5. Verificar mudança visual no perfil
6. Ir para /solicitacoes
7. Confirmar que a tela de solicitações também mudou
8. Recarregar a página
9. Confirmar que o tema escuro permanece
10. Voltar para /perfil
11. Trocar para Claro
12. Ir para /solicitacoes novamente
13. Confirmar que a tela voltou para o tema claro
```

---

## 9. Internacionalização com ngx-translate

### 9.1. Instalar pacotes

```bash
npm install @ngx-translate/core @ngx-translate/http-loader --legacy-peer-deps
```

### 9.2. Configurar no app.config.ts

Arquivo:

```txt
src/app/app.config.ts
```

Adicionar imports:

```ts
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
```

Adicionar em `providers`:

```ts
provideTranslateService({
  fallbackLang: 'pt-BR',
  lang: 'pt-BR',
  loader: provideTranslateHttpLoader({
    prefix: '/assets/i18n/',
    suffix: '.json',
  }),
}),
```

### 9.3. Conferir app.config.ts com Firebase e Translate

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

    provideTranslateService({
      fallbackLang: 'pt-BR',
      lang: 'pt-BR',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
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

### 9.4. Criar arquivos de tradução

Criar a estrutura:

```txt
public/assets/i18n/pt-BR.json
public/assets/i18n/en-US.json
```

A estrutura final deve ficar assim:

```txt
painel-credito
├── public
│   └── assets
│       └── i18n
│           ├── pt-BR.json
│           └── en-US.json
├── src
│   └── app
├── angular.json
├── package.json
```

### 9.5. Criar pt-BR.json

Arquivo:

```txt
public/assets/i18n/pt-BR.json
```

```json
{
  "APP": {
    "TITLE": "Painel de Solicitações de Crédito",
    "SUBTITLE": "Gerencie e acompanhe as solicitações de crédito"
  },
  "LOGIN": {
    "TITLE": "Entrar no Painel de Crédito",
    "DESCRIPTION": "Acesse sua conta para visualizar e gerenciar as solicitações de crédito.",
    "EMAIL": "Email",
    "PASSWORD": "Senha",
    "ENTER": "Entrar",
    "ENTERING": "Entrando...",
    "GOOGLE": "Entrar com Google"
  },
  "PROFILE": {
    "TITLE": "Perfil e Configurações",
    "PREFERENCES": "Preferências",
    "SECURITY": "Segurança",
    "LANGUAGE": "Idioma",
    "THEME": "Tema",
    "LIGHT": "Claro",
    "DARK": "Escuro",
    "LOGOUT": "Sair da conta"
  },
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
  "ACTIONS": {
    "REQUESTS": "Solicitações",
    "NEW_REQUEST": "Nova Solicitação",
    "EDIT": "Editar",
    "ANALYZE": "Analisar",
    "DELETE": "Excluir",
    "LOGOUT": "Sair",
    "PROFILE": "Perfil"
  },
  "SEARCH": {
    "PLACEHOLDER": "Buscar cliente"
  },
  "FILTER": {
    "ALL": "Todos"
  },
  "STATUS": {
    "PENDING": "Pendente",
    "APPROVED": "Aprovado",
    "REJECTED": "Recusado"
  },
  "REQUEST": {
    "DATE": "Data da Solicitação"
  }
}
```

### 9.6. Criar en-US.json

Arquivo:

```txt
public/assets/i18n/en-US.json
```

```json
{
  "APP": {
    "TITLE": "Credit Requests Dashboard",
    "SUBTITLE": "Manage and track credit requests"
  },
  "LOGIN": {
    "TITLE": "Sign in to the Credit Dashboard",
    "DESCRIPTION": "Access your account to view and manage credit requests.",
    "EMAIL": "Email",
    "PASSWORD": "Password",
    "ENTER": "Sign in",
    "ENTERING": "Signing in...",
    "GOOGLE": "Sign in with Google"
  },
  "PROFILE": {
    "TITLE": "Profile and Settings",
    "PREFERENCES": "Preferences",
    "SECURITY": "Security",
    "LANGUAGE": "Language",
    "THEME": "Theme",
    "LIGHT": "Light",
    "DARK": "Dark",
    "LOGOUT": "Sign out"
  },
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
  "ACTIONS": {
    "REQUESTS": "Requests",
    "NEW_REQUEST": "New Request",
    "EDIT": "Edit",
    "ANALYZE": "Review",
    "DELETE": "Delete",
    "LOGOUT": "Sign out",
    "PROFILE": "Profile"
  },
  "SEARCH": {
    "PLACEHOLDER": "Search client"
  },
  "FILTER": {
    "ALL": "All"
  },
  "STATUS": {
    "PENDING": "Pending",
    "APPROVED": "Approved",
    "REJECTED": "Rejected"
  },
  "REQUEST": {
    "DATE": "Request Date"
  }
}
```

### 9.7. Testar se os arquivos carregam

Abrir no navegador:

```txt
http://localhost:4200/assets/i18n/pt-BR.json
```

Depois abrir:

```txt
http://localhost:4200/assets/i18n/en-US.json
```

### 9.8. Atualizar o header para usar tradução

Arquivo:

```txt
src/app/components/shared/header/header.ts
```

```ts
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import { PreferencesService } from '../../../services/preferences.service';

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
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

Arquivo:

```txt
src/app/components/shared/header/header.html
```

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
        {{ 'APP.SUBTITLE' | translate }}
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

        <button type="button" class="header__logout" (click)="logout()">
          {{ 'ACTIONS.LOGOUT' | translate }}
        </button>
      </div>
    }
  </div>
</header>
```

### 9.9. Atualizar lista de solicitações

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.ts
```

Adicionar:

```ts
import { TranslatePipe } from '@ngx-translate/core';
```

Incluir `TranslatePipe` nos imports do componente.

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-lista/solicitacao-lista.html
```

```html
<div class="page-container">
  <app-header [title]="'APP.TITLE' | translate"></app-header>

  <app-resumo-solicitacoes
    [lista]="facade.listaFiltrada()"
  ></app-resumo-solicitacoes>

  <div class="top-bar">
    <div class="left">
      <button
        type="button"
        class="btn-novo"
        (click)="irParaNova()"
      >
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
      <app-solicitacao-item
        [solicitacao]="item"
      ></app-solicitacao-item>
    </div>
  </div>
</div>
```

### 9.10. Atualizar busca

Arquivo:

```txt
src/app/components/solicitacoes/busca-solicitacoes/busca-solicitacoes.ts
```

```ts
import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-busca-solicitacoes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './busca-solicitacoes.html',
  styleUrls: ['./busca-solicitacoes.scss'],
})
export class BuscaSolicitacoesComponent {
  @Output() buscaChange = new EventEmitter<string>();

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.buscaChange.emit(input.value);
  }
}
```

Arquivo:

```txt
src/app/components/solicitacoes/busca-solicitacoes/busca-solicitacoes.html
```

```html
<input
  type="text"
  (input)="onChange($event)"
  [placeholder]="'SEARCH.PLACEHOLDER' | translate"
/>
```

### 9.11. Atualizar filtro

Arquivo:

```txt
src/app/components/solicitacoes/filtro-solicitacoes/filtro-solicitacoes.ts
```

```ts
import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-filtro-solicitacoes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './filtro-solicitacoes.html',
  styleUrls: ['./filtro-solicitacoes.scss'],
})
export class FiltroSolicitacoesComponent {
  @Output() filtroChange = new EventEmitter<string>();

  selecionar(status: string) {
    this.filtroChange.emit(status);
  }
}
```

Arquivo:

```txt
src/app/components/solicitacoes/filtro-solicitacoes/filtro-solicitacoes.html
```

```html
<div class="filtro-container">
  <select #select class="filtro-select" (change)="selecionar(select.value)">
    <option value="">
      {{ 'FILTER.ALL' | translate }}
    </option>

    <option value="pendente">
      {{ 'STATUS.PENDING' | translate }}
    </option>

    <option value="aprovado">
      {{ 'STATUS.APPROVED' | translate }}
    </option>

    <option value="recusado">
      {{ 'STATUS.REJECTED' | translate }}
    </option>
  </select>
</div>
```

### 9.12. Atualizar card de solicitação

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-item/solicitacao-item.ts
```

Adicionar:

```ts
import { TranslatePipe } from '@ngx-translate/core';
```

Incluir no decorator:

```ts
imports: [CommonModule, TranslatePipe],
```

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-item/solicitacao-item.html
```

```html
<div class="card">
  <div class="card__header">
    <h3 class="card__cliente">{{ solicitacao.cliente }}</h3>

    <span
      (click)="irParaDetalhe()"
      class="card__status"
      [ngClass]="solicitacao.statusClass"
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
    <button type="button" (click)="editar(); $event.stopPropagation()">
      {{ 'ACTIONS.EDIT' | translate }}
    </button>

    <button type="button" (click)="irParaDetalhe(); $event.stopPropagation()">
      {{ 'ACTIONS.ANALYZE' | translate }}
    </button>

    <button type="button" (click)="deletar(); $event.stopPropagation()">
      {{ 'ACTIONS.DELETE' | translate }}
    </button>
  </div>
</div>
```

### 9.13. Atualizar formulário com tradução

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.ts
```

Adicionar:

```ts
import { TranslatePipe } from '@ngx-translate/core';
```

Incluir no decorator:

```ts
imports: [CommonModule, FormsModule, TranslatePipe],
```

Arquivo:

```txt
src/app/components/solicitacoes/solicitacao-form/solicitacao-form.html
```

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

### 9.14. Atualizar perfil com tradução

Arquivo:

```txt
src/app/components/perfil/perfil-usuario/perfil-usuario.html
```

```html
<app-header [title]="'PROFILE.TITLE' | translate"></app-header>

<main class="perfil">
  <section class="perfil-card" aria-labelledby="titulo-perfil">
    <div class="perfil-card__header">
      @if (authService.usuario()?.photoURL) {
        <img
          class="perfil-card__foto"
          [src]="authService.usuario()?.photoURL"
          alt="Foto do usuário logado"
        />
      } @else {
        <div class="perfil-card__avatar" aria-hidden="true">
          {{ authService.usuario()?.email?.charAt(0)?.toUpperCase() }}
        </div>
      }

      <div>
        <h2 id="titulo-perfil">
          {{ authService.usuario()?.displayName || 'Usuário logado' }}
        </h2>

        <p>
          {{ authService.usuario()?.email }}
        </p>
      </div>
    </div>

    <div class="perfil-card__info">
      <p>
        <strong>Provedor:</strong>
        {{ authService.usuario()?.providerData?.[0]?.providerId || 'email/senha' }}
      </p>

      @if (authService.ultimoAcesso()) {
        <p>
          <strong>Último acesso:</strong>
          {{ authService.ultimoAcesso()?.date | date: 'dd/MM/yyyy HH:mm' }}
        </p>

        <p>
          <strong>Tipo de login:</strong>
          {{ authService.ultimoAcesso()?.provider }}
        </p>
      }
    </div>
  </section>

  <section class="preferencias-card" aria-labelledby="titulo-preferencias">
    <h2 id="titulo-preferencias">
      {{ 'PROFILE.PREFERENCES' | translate }}
    </h2>

    <div class="campo">
      <label for="idioma">
        {{ 'PROFILE.LANGUAGE' | translate }}
      </label>

      <select
        id="idioma"
        [value]="preferencesService.preferences().language"
        (change)="alterarIdioma($event)"
      >
        <option value="pt-BR">Português</option>
        <option value="en-US">English</option>
      </select>
    </div>

    <div class="campo">
      <label for="tema">
        {{ 'PROFILE.THEME' | translate }}
      </label>

      <select
        id="tema"
        [value]="preferencesService.preferences().theme"
        (change)="alterarTema($event)"
      >
        <option value="light">
          {{ 'PROFILE.LIGHT' | translate }}
        </option>

        <option value="dark">
          {{ 'PROFILE.DARK' | translate }}
        </option>
      </select>
    </div>
  </section>

  <section class="seguranca-card" aria-labelledby="titulo-seguranca">
    <h2 id="titulo-seguranca">
      {{ 'PROFILE.SECURITY' | translate }}
    </h2>

    <p>
      Nesta versão, o sistema registra o último acesso com data, email, provedor e navegador.
    </p>

    <p>
      Em uma aplicação real, informações como IP, localização aproximada e auditoria completa
      devem ser registradas no backend.
    </p>

    <button type="button" class="btn-sair" (click)="sair()">
      {{ 'PROFILE.LOGOUT' | translate }}
    </button>
  </section>
</main>
```

### 9.15. Atualizar login com tradução

Arquivo:

```txt
src/app/components/login/login/login.ts
```

Adicionar:

```ts
import { TranslatePipe } from '@ngx-translate/core';
```

Incluir no decorator:

```ts
imports: [CommonModule, FormsModule, TranslatePipe],
```

Arquivo:

```txt
src/app/components/login/login/login.html
```

```html
<div class="login">
  <div class="login__container">
    <div class="login__card">
      <h2>
        {{ 'LOGIN.TITLE' | translate }}
      </h2>

      <p class="login__description">
        {{ 'LOGIN.DESCRIPTION' | translate }}
      </p>

      <form class="login__form" (ngSubmit)="login()" novalidate>
        <label class="login__label" for="email">
          {{ 'LOGIN.EMAIL' | translate }}
        </label>

        <input
          id="email"
          type="email"
          name="email"
          [placeholder]="'LOGIN.EMAIL' | translate"
          class="login__input"
          [(ngModel)]="email"
          autocomplete="email"
        />

        <label class="login__label" for="senha">
          {{ 'LOGIN.PASSWORD' | translate }}
        </label>

        <input
          id="senha"
          type="password"
          name="senha"
          [placeholder]="'LOGIN.PASSWORD' | translate"
          class="login__input"
          [(ngModel)]="senha"
          autocomplete="current-password"
        />

        @if (authService.erro()) {
          <p class="login__error" aria-live="polite">
            {{ authService.erro() }}
          </p>
        }

        <button class="login__button" type="submit" [disabled]="carregando">
          {{ carregando ? ('LOGIN.ENTERING' | translate) : ('LOGIN.ENTER' | translate) }}
        </button>

        <button
          class="login__button login__button--google"
          type="button"
          (click)="loginComGoogle()"
          [disabled]="carregando"
        >
          {{ 'LOGIN.GOOGLE' | translate }}
        </button>
      </form>

      <p class="login__footer">
        Ambiente interno • Uso corporativo
      </p>
    </div>
  </div>
</div>
```

### 9.16. Testar internacionalização

```txt
1. Fazer login
2. Abrir /perfil
3. Confirmar se aparecem Preferências, Idioma, Tema e Segurança
4. Trocar idioma para English
5. Confirmar se Perfil, Preferências, Idioma, Tema, Claro/Escuro e Sair mudam
6. Ir para /solicitacoes
7. Confirmar se Header, Nova Solicitação, Perfil, Sair, Busca e Filtro mudam
8. Abrir formulário de nova solicitação
9. Confirmar se título, labels, placeholders e botões mudam
10. Recarregar a página
11. Confirmar se o idioma escolhido permanece
```

### 9.17. Problemas comuns

#### Texto aparece como chave

Exemplo:

```txt
PROFILE.THEME
```

Conferir se a chave existe em:

```txt
public/assets/i18n/pt-BR.json
public/assets/i18n/en-US.json
```

#### Texto fica em branco ou não muda

Conferir se o componente standalone importou o `TranslatePipe`.

```ts
import { TranslatePipe } from '@ngx-translate/core';
```

```ts
imports: [CommonModule, TranslatePipe],
```

#### JSON não carrega

Testar no navegador:

```txt
http://localhost:4200/assets/i18n/pt-BR.json
```

Se aparecer `Cannot GET`, conferir se os arquivos estão em:

```txt
public/assets/i18n/
```

#### Troca de idioma não funciona

Conferir se o `PreferencesService` chama:

```ts
this.translate.use(language);
```

---

## 10. Performance

### 10.1. Abrir DevTools > Network

Verificar:

```txt
1. Arquivos carregados
2. Chamadas para GraphQL
3. Chamadas do Firebase
4. Arquivos de tradução
5. Tamanho dos bundles
6. Tempo de resposta
7. Requisições duplicadas
```

### 10.2. Simular lentidão

No DevTools:

```txt
Network > Throttling > Slow 3G
```

Testar:

```txt
1. Abrir login
2. Fazer login
3. Abrir perfil
4. Trocar idioma
5. Abrir solicitações
```

### 10.3. Abrir DevTools > Performance

Gravar interações:

```txt
1. Login
2. Abrir perfil
3. Trocar tema
4. Trocar idioma
5. Abrir solicitações
6. Filtrar lista
7. Editar solicitação
```

### 10.4. Rodar Lighthouse

Avaliar:

```txt
1. Performance
2. Accessibility
3. Best Practices
```

### 10.5. Conferir otimizações

No item da solicitação, conferir se existe:

```ts
changeDetection: ChangeDetectionStrategy.OnPush
```

Na lista, conferir se existe:

```ts
trackById(index: number, item: SolicitacaoViewModel) {
  return item.id;
}
```

---

## 11. Acessibilidade aplicada

### 11.1. Checklist do login

```txt
1. Inputs têm label
2. Botão tem texto claro
3. Mensagem de erro tem aria-live
4. Foco é visível
5. Login funciona com teclado
```

### 11.2. Checklist do formulário

```txt
1. Campos têm label
2. Mensagens de erro aparecem próximas ao campo
3. aria-invalid informa erro
4. aria-describedby conecta campo e erro
5. aria-live comunica erro dinâmico
```

### 11.3. Checklist do perfil

```txt
1. Imagem tem alt
2. Fallback de avatar usa aria-hidden
3. Selects têm label
4. Botão sair é button
5. Navegação funciona com teclado
```

### 11.4. Checklist do header

```txt
1. Links são links
2. Sair é botão
3. Foco é visível
4. Navegação por teclado funciona
```

### 11.5. Teste de teclado

Testar:

```txt
Tab
Shift + Tab
Enter
Espaço
```

Verificar:

```txt
1. Chegar no email
2. Chegar na senha
3. Acionar Entrar
4. Acionar Entrar com Google
5. Navegar no header
6. Abrir perfil
7. Trocar idioma
8. Trocar tema
9. Sair
10. Preencher solicitação
11. Salvar
12. Cancelar
```

### 11.6. Garantir foco visível global

Arquivo:

```txt
src/styles.scss
```

Adicionar, se ainda não existir:

```scss
a:focus,
button:focus,
input:focus,
select:focus {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}
```

---

## 12. Teste final do fluxo da aula

Executar:

```txt
1. Abrir a aplicação
2. Acessar /solicitacoes sem login
3. Confirmar redirecionamento para /login
4. Fazer login com email e senha
5. Sair
6. Fazer login com Google
7. Abrir /perfil
8. Verificar foto, nome e email
9. Trocar tema para escuro
10. Recarregar a página
11. Confirmar tema persistido
12. Trocar idioma
13. Verificar textos traduzidos
14. Abrir /solicitacoes
15. Criar nova solicitação
16. Tentar salvar nome vazio
17. Tentar CPF inválido
18. Salvar CPF válido
19. Rodar Lighthouse
20. Testar navegação por teclado
```

---

## 13. Erros comuns e conferências

### Firebase não configurado

Conferir:

```txt
environment.ts
app.config.ts
Firebase Console
Authentication habilitado
```

### Login com Google não abre

Conferir:

```txt
provedor Google habilitado
domínio autorizado
popup bloqueado pelo navegador
```

### Tradução não carrega

Conferir:

```txt
caminho dos arquivos JSON
public/assets/i18n
configuração do loader
import do TranslatePipe
```

### Tema não persiste

Conferir:

```txt
localStorage
PreferencesService
classe no body
styles.scss
```

### Rota /perfil não abre

Conferir:

```txt
app.routes.ts
canActivate
nome do componente
caminho do import
```
