import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-busca-solicitacoes',
  standalone: true,
  templateUrl: './busca-solicitacoes.html'
})
export class BuscaSolicitacoesComponent {

  @Output() buscaChange = new EventEmitter<string>();

  onChange(event: any) {
    this.buscaChange.emit(event.target.value);
  }
}
