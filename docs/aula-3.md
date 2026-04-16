# ETAPA 1 — CRIAR FLUXO DE LOGIN (SEM SEGURANÇA AINDA)

---

# OBJETIVO

- Exibir a tela de login como primeira tela  
- Criar o componente header  
- Criar fluxo de navegação para o painel  
- Preparar a base para autenticação  

---

# PASSO 1 — CRIAR COMPONENTE LOGIN

```bash
ng generate component components/login/login --standalone
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
  <div class="login__container">

    <div class="login__card">
      <h2>Acesso</h2>

      <div class="login__form">
        <input
          type="text"
          placeholder="Usuário"
          class="login__input"
        />

        <input
          type="password"
          placeholder="Senha"
          class="login__input"
        />

        <button class="login__button" (click)="login()">
          Entrar
        </button>
      </div>

      <p class="login__footer">
        Ambiente interno • Uso corporativo
      </p>
    </div>

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

  background: linear-gradient(135deg, #1976d2, #0d47a1);
}

.login__container {
  display: flex;
  gap: 40px;
  align-items: center;
}

.login__card {
  background: #ffffff;
  padding: 32px;
  border-radius: 16px;

  width: 320px;

  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);

  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login__card h2 {
  font-size: 20px;
  font-weight: 600;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login__input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;

  font-size: 14px;

  transition: border 0.2s;
}

.login__input:focus {
  outline: none;
  border-color: #1976d2;
}

.login__button {
  margin-top: 8px;

  padding: 12px;
  border: none;
  border-radius: 8px;

  background: #1976d2;
  color: white;

  font-weight: 600;
  cursor: pointer;

  transition: all 0.2s ease;
}

.login__button:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.login__footer {
  font-size: 12px;
  color: #888;
  text-align: center;
}
```

---

# PASSO 2 — AJUSTAR APP COMPONENT

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

# PASSO 3 — CONFIGURAR APP.CONFIG

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

# PASSO 4 — CONFIGURAR ROTAS

# ARQUIVO — src/app/app.routes.ts

```ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
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

# PASSO 5 — TESTAR NAVEGAÇÃO

1. Executar a aplicação

```bash
ng serve
```

2. Acessar no navegador:

```
http://localhost:4200
```

3. Verificar:

- Tela de login carregando
- Botão "Entrar" redirecionando para `/solicitacoes`

---

# RESULTADO ESPERADO

- Aplicação inicia na tela de login  
- Clique em "Entrar" navega para o painel  
- Estrutura baseada em rotas funcionando  
- Base pronta para implementar autenticação real  
```