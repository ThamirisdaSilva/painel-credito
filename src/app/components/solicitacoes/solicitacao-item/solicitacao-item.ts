import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitacaoItemComponent {
  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;

  constructor(
    private router: Router,
    private facade: SolicitacoesFacade,
  ) {}

  irParaDetalhe() {
    this.router.navigate(['/solicitacoes', this.solicitacao.id]);
  }

  editar() {
    this.router.navigate(['/solicitacoes/editar', this.solicitacao.id]);
  }

  deletar() {
    this.facade.deletar(this.solicitacao.id);
  }
}
