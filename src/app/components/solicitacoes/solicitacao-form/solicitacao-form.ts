import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { StatusSolicitacao } from '../../../models/solicitacao.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './solicitacao-form.html',
  styleUrls: ['./solicitacao-form.scss'],
})
export class SolicitacaoFormComponent implements OnInit {
  cliente = '';
  documento = '';
  valor: number = 0;

  modoEdicao = false;
  idEdicao: number | null = null;

  nomeInvalido = false;
  cpfInvalido = false;

  constructor(
    private facade: SolicitacoesFacade,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);

      this.modoEdicao = true;
      this.idEdicao = id;

      const item = this.facade.getById(id);

      if (item) {
        this.cliente = item.cliente;
        this.documento = item.documento;
        this.valor = item.valor;
      }
    }
  }

  apenasNumeros(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.documento = input.value;
  }

  salvar() {
    this.nomeInvalido = this.cliente.trim() === '';
    this.cpfInvalido = !/^\d{11}$/.test(this.documento);

    if (this.nomeInvalido || this.cpfInvalido) {
      return;
    }

    if (this.modoEdicao && this.idEdicao) {
      this.facade.editar(this.idEdicao, {
        id: this.idEdicao,
        cliente: this.cliente.trim(),
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: '',
      });
    } else {
      this.facade.criar({
        id: Date.now(),
        cliente: this.cliente.trim(),
        documento: this.documento,
        valor: this.valor,
        dataSolicitacao: new Date().toISOString(),
        status: 'pendente' as StatusSolicitacao,
        statusClass: '',
        statusLabel: '',
      });
    }

    this.router.navigate(['/solicitacoes']);
  }

  cancelar() {
    this.router.navigate(['/solicitacoes']);
  }
}
