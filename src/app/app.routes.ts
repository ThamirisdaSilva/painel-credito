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
