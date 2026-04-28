import { Component, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-filtro-solicitacoes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './filtro-solicitacoes.html',
  styleUrl: './filtro-solicitacoes.scss',
})
export class FiltroSolicitacoesComponent {
  @Output() filtroChange = new EventEmitter<string>();

  selecionar(status: string) {
    this.filtroChange.emit(status);
  }
}
