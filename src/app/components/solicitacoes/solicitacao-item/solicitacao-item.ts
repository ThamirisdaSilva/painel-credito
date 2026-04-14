import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoViewModel } from '../../../services/graphql.service';

@Component({
  selector: 'app-solicitacao-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-item.html',
  styleUrls: ['./solicitacao-item.scss']
})
export class SolicitacaoItemComponent {
  @Input({ required: true }) solicitacao!: SolicitacaoViewModel;
}