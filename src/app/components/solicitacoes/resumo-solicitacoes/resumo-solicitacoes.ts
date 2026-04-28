import { Component, computed, input } from '@angular/core'; // Importe o 'input'
import { SolicitacaoViewModel } from '../../../services/graphql.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-resumo-solicitacoes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './resumo-solicitacoes.html',
})
export class ResumoSolicitacoesComponent {
  // Transforma em Signal Input
  lista = input<SolicitacaoViewModel[]>([]);

  resumo = computed(() => {
    const dados = this.lista();

    return {
      total: dados.length,
      aprovadas: dados.filter((i) => i.status === 'aprovado').length,
      pendentes: dados.filter((i) => i.status === 'pendente').length,
      recusadas: dados.filter((i) => i.status === 'recusado').length,
    };
  });
}
