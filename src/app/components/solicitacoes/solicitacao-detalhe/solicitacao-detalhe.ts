import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacoesService } from '../../../services/graphql.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitacao-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacao-detalhe.html',
  styleUrl: './solicitacao-detalhe.scss'
})
export class SolicitacaoDetalheComponent implements OnInit {

  id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public service: SolicitacoesService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.service.solicitacoes().length === 0) {
      this.service.carregarSolicitacoes();
    }
  }

  get item() {
    return this.service.solicitacoes()
      .find(s => String(s.id) === String(this.id));
  }

  aprovar() {
    this.service.atualizarStatus(this.id, 'aprovado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }

  reprovar() {
    this.service.atualizarStatus(this.id, 'recusado');

    setTimeout(() => {
      this.router.navigate(['/solicitacoes']);
    }, 300);
  }
}