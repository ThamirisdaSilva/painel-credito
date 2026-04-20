import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoItemComponent } from '../solicitacao-item/solicitacao-item';
import { SolicitacaoViewModel, SolicitacoesService } from '../../../services/graphql.service';
import { HeaderComponent } from "../../shared/header/header";
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-solicitacao-lista',
  standalone: true,
  imports: [CommonModule, SolicitacaoItemComponent, HeaderComponent, ScrollingModule],
  templateUrl: './solicitacao-lista.html',
  styleUrls: ['./solicitacao-lista.scss']
})
export class SolicitacaoListaComponent implements OnInit {

  constructor(public service: SolicitacoesService) {}

  ngOnInit() {
    if (this.service.solicitacoes().length === 0) {
      this.service.carregarSolicitacoes();
    }
  }

  trackById(index: number, item: SolicitacaoViewModel){
    return item.id;
  }
}