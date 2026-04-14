import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacoesService } from '../../../services/solicitacoes.service';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent],
  templateUrl: './solicitacao-lista.html',
  styleUrl: './solicitacao-lista.scss'
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  ngOnInit() {
    this.service.carregarSolicitacoes();
  }
}