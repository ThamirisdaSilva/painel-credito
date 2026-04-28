import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AtividadesService } from '../../../services/atividades.service';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-atividades-lista',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, HeaderComponent],
  templateUrl: './atividades-lista.html',
  styleUrl: './atividades-lista.scss',
})
export class AtividadesListaComponent {
  private atividadesService = inject(AtividadesService);

  atividades$ = this.atividadesService.listarAtividades();

  getIcone(tipo: string) {
    const icones: Record<string, string> = {
      login: '🔐',
      logout: '🚪',
      criacao: '📝',
      edicao: '✏️',
      aprovacao: '✅',
      recusa: '❌',
      exclusao: '🗑️',
      tema: '🌙',
      idioma: '🌐',
      erro: '⚠️',
    };

    return icones[tipo] ?? '📌';
  }

  getTitulo(tipo: string) {
    const titulos: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      criacao: 'Criação',
      edicao: 'Edição',
      aprovacao: 'Aprovação',
      recusa: 'Recusa',
      exclusao: 'Exclusão',
      tema: 'Tema',
      idioma: 'Idioma',
      erro: 'Erro',
    };

    return titulos[tipo] ?? 'Atividade';
  }
}
