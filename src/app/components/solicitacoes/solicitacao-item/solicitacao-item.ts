import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
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
    if (!this.solicitacao.id) {
      return;
    }

    this.router.navigate(['/solicitacoes', this.solicitacao.id]);
  }

  editar() {
    if (!this.solicitacao.id) {
      return;
    }

    this.router.navigate(['/solicitacoes/editar', this.solicitacao.id]);
  }

  deletar() {
    if (!this.solicitacao.id) {
      return;
    }

    this.facade.deletar(this.solicitacao.id);
  }
}
