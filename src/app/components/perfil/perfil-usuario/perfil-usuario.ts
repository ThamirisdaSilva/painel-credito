import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth.service';
import { AppLanguage, AppTheme, PreferencesService } from '../../../services/preferences.service';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe, HeaderComponent],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.scss'],
})
export class PerfilUsuarioComponent {
  constructor(
    public authService: AuthService,
    public preferencesService: PreferencesService,
    private router: Router,
  ) {}

  alterarIdioma(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.preferencesService.alterarIdioma(select.value as AppLanguage);
  }

  alterarTema(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.preferencesService.alterarTema(select.value as AppTheme);
  }

  async sair() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
