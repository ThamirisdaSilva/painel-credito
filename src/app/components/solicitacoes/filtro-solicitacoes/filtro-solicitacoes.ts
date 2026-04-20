import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filtro-solicitacoes',
  standalone: true,
  templateUrl: './filtro-solicitacoes.html',
  styleUrl: './filtro-solicitacoes.scss'
})
export class FiltroSolicitacoesComponent {

  @Output() filtroChange = new EventEmitter<string>();

  selecionar(status: string) {
    this.filtroChange.emit(status);
  }
}