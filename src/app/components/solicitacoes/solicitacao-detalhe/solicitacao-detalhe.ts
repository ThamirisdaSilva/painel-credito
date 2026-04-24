import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacoesService } from '../../../services/graphql.service';
import { CommonModule } from '@angular/common';
import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';

@Component({
  selector: 'app-solicitacao-detalhe',
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacao-detalhe.html',
  styleUrl: './solicitacao-detalhe.scss',
})
export class SolicitacaoDetalheComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public service = inject(SolicitacoesService);
  public facade = inject(SolicitacoesFacade);

  id = signal<number>(0);

  item = computed(() => {
    const idValue = this.id();
    return this.facade.lista().find((solicitacao) => String(solicitacao.id) === String(idValue));
  });

  ngOnInit() {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.id.set(routeId);
    this.facade.carregar();
  }

  aprovar() {
    this.facade.atualizarStatus(this.id(), 'aprovado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }

  reprovar() {
    this.facade.atualizarStatus(this.id(), 'recusado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }
}
