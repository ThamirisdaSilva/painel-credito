# ETAPA 1 — CRIAR FLUXO DE LOGIN (SEM SEGURANÇA AINDA)

---

# OBJETIVO

- Exibir a tela de login como primeira tela  
- Criar fluxo de navegação para o painel  
- Preparar a base para autenticação  

---

# ARQUIVO — src/app/app.ts

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {}
```

---

# ARQUIVO — src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent)
  }
];
```

---

# ARQUIVO — src/app/app.config.ts

```ts
import { ApplicationConfig, inject, LOCALE_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

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

# ARQUIVO — src/app/components/login/login.ts

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/solicitacoes']);
  }
}
```

---

# ARQUIVO — src/app/components/login/login.html

```html
<div class="login">
  <div class="login__card">
    <h2 class="login__title">Acesso ao Sistema</h2>

    <p class="login__subtitle">
      Faça login para visualizar as solicitações
    </p>

    <button class="login__button" (click)="login()">
      Entrar
    </button>
  </div>
</div>
```

---

# ARQUIVO — src/app/components/login/login.scss

```scss
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
}

.login__card {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 300px;
}

.login__title {
  font-size: 20px;
  font-weight: 600;
}

.login__subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.login__button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #1976d2;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.login__button:hover {
  background: #1565c0;
}
```

---

# RESULTADO ESPERADO

- aplicação inicia na tela de login ✔️  
- botão "Entrar" navega para `/solicitacoes` ✔️  
- painel continua funcionando normalmente ✔️  
- base pronta para adicionar autenticação real ✔️  


# ETAPA 2 — CRIAR AUTENTICAÇÃO (AUTH SERVICE + JWT)

---

# OBJETIVO

- Simular autenticação no frontend  
- Gerar um token JWT mock  
- Persistir o token no navegador  
- Preparar base para interceptor e guard  

---

# ARQUIVO — src/app/services/auth.service.ts

```ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'auth_token';

  isAuthenticated = signal(false);

  login() {
    const token = this.generateMockToken();

    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  decodeToken() {
    const token = this.getToken();

    if (!token) return null;

    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();

    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);

    return payload.exp < now;
  }

  private generateMockToken(): string {
    const payload = {
      sub: 'user123',
      name: 'Usuário Teste',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1h
    };

    return btoa(JSON.stringify(payload));
  }
}
```

---

# AJUSTE NO LOGIN

## 📁 src/app/components/login/login.ts

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    this.authService.login();
    this.router.navigate(['/solicitacoes']);
  }
}
```

---

# TESTE ESPERADO

1. abrir aplicação → `/login`
2. clicar em **Entrar**
3. verificar no navegador:

DevTools → Application → Local Storage

```txt
auth_token: "eyJzdWIiOi..."
```

---

# RESULTADO

- token sendo criado ✔️  
- token persistido ✔️  
- usuário considerado "logado" ✔️  
- base pronta para proteção de rotas ✔️  

# ETAPA 3 — PROTEGER ROTAS COM AUTH GUARD

---

# OBJETIVO

- Impedir acesso ao painel sem login  
- Redirecionar usuário para a tela de login  
- Validar existência do token  

---

# ARQUIVO — src/app/guards/auth.guard.ts

```ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
```

---

# APLICAR O GUARD NA ROTA

## 📁 src/app/app.routes.ts

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
      import('./components/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent),
    canActivate: [authGuard]
  }
];
```

---

# TESTE IMPORTANTE

## ⚠️ Antes de testar

Se você já clicou em "Entrar" anteriormente, o token continua salvo no navegador.

👉 Isso significa que o guard vai permitir o acesso.

---

## COMO LIMPAR O TOKEN

No console do navegador:

```js
localStorage.removeItem('auth_token')
```

---

# CENÁRIOS DE TESTE

## CENÁRIO 1 — SEM TOKEN

1. limpar o token  
2. acessar `/solicitacoes`  

👉 Resultado:
- redireciona para `/login` ✔️  

---

## CENÁRIO 2 — COM TOKEN

1. clicar em "Entrar"  
2. acessar `/solicitacoes`  

👉 Resultado:
- acesso liberado ✔️  

---

# OBSERVAÇÃO

Neste momento o guard valida apenas:

- existência do token  

Ainda não valida:

- expiração (`exp`)  
- permissões  
- roles  

---

# RESULTADO

- rota protegida ✔️  
- fluxo de autenticação funcional ✔️  
- comportamento previsível ✔️  

# ETAPA 4 — INTERCEPTOR (ENVIANDO TOKEN PARA API)

---

# OBJETIVO

- Enviar automaticamente o token em todas as requisições  
- Simular comportamento real de autenticação  
- Integrar com chamadas GraphQL (Apollo)  

---

# ARQUIVO — src/app/interceptors/auth.interceptor.ts

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};
```

---

# REGISTRAR O INTERCEPTOR

## 📁 src/app/app.config.ts

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
```

---

## AJUSTE NOS PROVIDERS

```ts
provideHttpClient(
  withInterceptors([authInterceptor])
),
```

---

# EXEMPLO COMPLETO (TRECHO)

```ts
export const appConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    }
  ]
};
```

---

# TESTE

## PASSO 1 — GARANTIR TOKEN

```js
localStorage.getItem('auth_token')
```

---

## PASSO 2 — ABRIR NETWORK

- DevTools → Network  
- filtrar por `graphql`  

---

## PASSO 3 — OBSERVAR HEADERS

Você verá:

```http
Authorization: Bearer eyJzdWIiOi...
```

---

# RESULTADO

- token enviado automaticamente ✔️  
- integração com API funcionando ✔️  
- nenhuma alteração nos componentes ✔️  

---

# OBSERVAÇÃO IMPORTANTE

O interceptor funciona também com GraphQL porque:

- Apollo usa HttpClient internamente  
- portanto o interceptor intercepta a requisição  

---

# ETAPA 5 — TRATAR ERRO 401 (LOGOUT AUTOMÁTICO)

---

# OBJETIVO

- Detectar quando a API retorna erro 401  
- Deslogar automaticamente o usuário  
- Redirecionar para a tela de login  

---

# AJUSTAR INTERCEPTOR

## 📁 src/app/interceptors/auth.interceptor.ts

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
```

---

# ETAPA 5 SIMULAR ERRO 401

## OPÇÃO 1 — FORÇAR NO SERVICE

## graphql.service.ts

```ts
error: () => {
  this.error.set('Erro 401 - Não autorizado');
  this.loading.set(false);
}
```

---

## OPÇÃO 2 — REMOVER TOKEN MANUALMENTE

```js
localStorage.removeItem('auth_token')
```

E tentar acessar a rota protegida

---

## OPÇÃO 3 — ALTERAR BACKEND (OPCIONAL)

Simular resposta:

```js
res.status(401).json({ error: 'Não autorizado' });
```

---

# TESTE ESPERADO

## CENÁRIO — TOKEN INVÁLIDO OU AUSENTE

1. acessar `/solicitacoes`
2. requisição falha com 401  

👉 Resultado:
- usuário deslogado ✔️  
- redirecionado para `/login` ✔️  

---

# RESULTADO

- tratamento global de erro ✔️  
- segurança reforçada ✔️  
- experiência real de aplicação ✔️  

---

# OBSERVAÇÃO

Agora o sistema já possui:

- autenticação simulada  
- proteção de rotas  
- envio de token  
- tratamento de falha  

👉 fluxo completo de segurança no frontend  

---

