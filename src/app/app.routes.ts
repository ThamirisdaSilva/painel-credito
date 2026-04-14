import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/solicitacoes/solicitacao-lista/solicitacao-lista')
        .then(m => m.SolicitacaoListaComponent)
  }
];
