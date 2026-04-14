import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { SolicitacoesService } from '../../../services/graphql.service';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  ngOnInit() {
    this.service.carregarSolicitacoes();
  }
}