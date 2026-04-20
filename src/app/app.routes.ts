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
      import('./components/login/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'solicitacoes',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent),
    canActivate: [authGuard]
  },
  {
  path: 'solicitacoes/:id',
  loadComponent: () =>
    import('./components/solicitacoes/solicitacao-detalhe/solicitacao-detalhe')
      .then(m => m.SolicitacaoDetalheComponent)
}
];
