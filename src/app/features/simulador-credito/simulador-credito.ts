import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { HeaderComponent } from '../../shared/components/header/header';

@Component({
  selector: 'app-simulador-credito',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, TranslatePipe, HeaderComponent],
  templateUrl: './simulador-credito.html',
  styleUrls: ['./simulador-credito.scss'],
})
export class SimuladorCreditoComponent {
  valorSolicitado = signal(10000);
  prazoMeses = signal(12);
  taxaJuros = signal(2);

  taxaDecimal = computed(() => this.taxaJuros() / 100);

  valorParcela = computed(() => {
    const valor = this.valorSolicitado();
    const prazo = this.prazoMeses();
    const taxa = this.taxaDecimal();

    if (prazo <= 0) {
      return 0;
    }

    if (taxa === 0) {
      return valor / prazo;
    }

    const fator = Math.pow(1 + taxa, prazo);

    return valor * ((taxa * fator) / (fator - 1));
  });

  valorTotalPago = computed(() => {
    return this.valorParcela() * this.prazoMeses();
  });

  totalJuros = computed(() => {
    return this.valorTotalPago() - this.valorSolicitado();
  });

  constructor(private router: Router) {}

  alterarValor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valorSolicitado.set(Number(input.value));
  }

  alterarPrazo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.prazoMeses.set(Number(input.value));
  }

  alterarTaxa(event: Event) {
    const input = event.target as HTMLInputElement;
    this.taxaJuros.set(Number(input.value));
  }

  resetarSimulacao() {
    this.valorSolicitado.set(10000);
    this.prazoMeses.set(12);
    this.taxaJuros.set(2);
  }

  irParaNovaSolicitacao() {
    this.router.navigate(['/solicitacoes/nova']);
  }
}
