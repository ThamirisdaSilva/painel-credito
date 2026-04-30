// src/app/components/simulador-credito/simulador-credito.ts

import { Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from '../shared/header/header';

@Component({
  selector: 'app-simulador-credito',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, TranslatePipe, HeaderComponent],
  templateUrl: './simulador-credito.html',
  styleUrl: './simulador-credito.scss',
})
export class SimuladorCreditoComponent {
  valorSolicitado = signal(10000);
  prazoMeses = signal(12);
  taxaMensal = signal(2);

  parcelaAproximada = computed(() => {
    const valor = this.valorSolicitado();
    const prazo = this.prazoMeses();
    const taxa = this.taxaMensal() / 100;

    if (taxa === 0) {
      return valor / prazo;
    }

    return valor * (taxa / (1 - Math.pow(1 + taxa, -prazo)));
  });

  totalPago = computed(() => {
    return this.parcelaAproximada() * this.prazoMeses();
  });

  totalJuros = computed(() => {
    return this.totalPago() - this.valorSolicitado();
  });

  atualizarValor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valorSolicitado.set(Number(input.value));
  }

  atualizarPrazo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.prazoMeses.set(Number(input.value));
  }

  atualizarTaxa(event: Event) {
    const input = event.target as HTMLInputElement;
    this.taxaMensal.set(Number(input.value));
  }

  resetar() {
    this.valorSolicitado.set(10000);
    this.prazoMeses.set(12);
    this.taxaMensal.set(2);
  }

  criarSolicitacao() {
    console.log('Criar solicitação a partir da simulação', {
      valorSolicitado: this.valorSolicitado(),
      prazoMeses: this.prazoMeses(),
      taxaMensal: this.taxaMensal(),
      parcelaAproximada: this.parcelaAproximada(),
      totalPago: this.totalPago(),
      totalJuros: this.totalJuros(),
    });
  }
}
