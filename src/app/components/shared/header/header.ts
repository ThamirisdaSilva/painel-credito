import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import { PreferencesService } from '../../../services/preferences.service';
import { AtividadesService } from '../../../services/atividades.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title = '';

  isOffline = !navigator.onLine;

  constructor(
    public authService: AuthService,
    public preferencesService: PreferencesService,
    private atividadesService: AtividadesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isOffline = !navigator.onLine;
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true;
  }

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false;
  }

  estaNaTelaLogin() {
    return this.router.url === '/login';
  }

  async logout() {
    await this.atividadesService.registrarAtividade({
      tipo: 'logout',
      descricao: 'Usuário saiu da aplicação',
      entidade: 'usuario',
    });

    await this.authService.logout();

    this.router.navigate(['/login']);
  }
}
