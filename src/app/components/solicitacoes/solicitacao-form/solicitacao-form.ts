import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { SolicitacoesFacade } from '../../../services/solicitacoes.facade';
import { StatusSolicitacao } from '../../../models/solicitacao.model';

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
  idEdicao: string | null = null;

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
      this.modoEdicao = true;
      this.idEdicao = idParam;

      const item = this.facade.getById(idParam);

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

  async salvar() {
    this.nomeInvalido = this.cliente.trim() === '';
    this.cpfInvalido = !/^\d{11}$/.test(this.documento);

    if (this.nomeInvalido || this.cpfInvalido) {
      return;
    }

    const dados = {
      cliente: this.cliente.trim(),
      documento: this.documento,
      valor: this.valor,
      dataSolicitacao: new Date().toISOString(),
      status: 'pendente' as StatusSolicitacao,
    };

    if (this.modoEdicao && this.idEdicao) {
      await this.facade.editar(this.idEdicao, dados);
    } else {
      await this.facade.criar(dados);
    }

    this.router.navigate(['/solicitacoes']);
  }

  cancelar() {
    this.router.navigate(['/solicitacoes']);
  }
}
