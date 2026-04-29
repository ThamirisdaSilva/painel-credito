import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitacao-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './solicitacao-detalhe.html',
  styleUrl: './solicitacao-detalhe.scss',
})
export class SolicitacaoDetalheComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public facade = inject(SolicitacoesFacade);

  id = signal<string | null>(null);

  item = computed(() => {
    const idValue = this.id();

    if (!idValue) {
      return undefined;
    }

    return this.facade.lista().find((solicitacao) => solicitacao.id === idValue);
  });

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');

    this.id.set(routeId);
    this.facade.carregar();
  }

  async enviarParaAnalise() {
    const idValue = this.id();

    if (!idValue) {
      return;
    }

    await this.facade.atualizarStatus(idValue, 'em_analise');

    this.router.navigate(['/solicitacoes']);
  }

  async aprovar() {
    const idValue = this.id();

    if (!idValue) {
      return;
    }

    await this.facade.atualizarStatus(idValue, 'aprovado');

    this.router.navigate(['/solicitacoes']);
  }

  async reprovar() {
    const idValue = this.id();

    if (!idValue) {
      return;
    }

    await this.facade.atualizarStatus(idValue, 'recusado');

    this.router.navigate(['/solicitacoes']);
  }
}
