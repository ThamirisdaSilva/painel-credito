import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { StatusSolicitacao } from '../../../models/solicitacao.model';

@Component({
  selector: 'app-solicitacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacao-form.html',
  styleUrls: ['./solicitacao-form.scss'],
})
export class SolicitacaoFormComponent implements OnInit {
  cliente = '';
  documento = '';
  valor: number = 0;

  modoEdicao = false;
  idEdicao: number | null = null;

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

  salvar() {
    if (this.modoEdicao && this.idEdicao) {
      this.facade.editar(this.idEdicao, {
        id: this.idEdicao,
        cliente: this.cliente,
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
        cliente: this.cliente,
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
