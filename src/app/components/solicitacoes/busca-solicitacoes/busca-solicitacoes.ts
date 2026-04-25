import { Component, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-busca-solicitacoes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './busca-solicitacoes.html',
})
export class BuscaSolicitacoesComponent {
  @Output() buscaChange = new EventEmitter<string>();

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.buscaChange.emit(input.value);
  }
}
