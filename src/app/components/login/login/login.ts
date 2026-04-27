import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  email = '';
  senha = '';
  carregando = false;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  async login() {
    this.carregando = true;

    const usuario = await this.authService.loginComEmailSenha(this.email, this.senha);

    this.carregando = false;

    if (usuario) {
      this.router.navigate(['/solicitacoes']);
    }
  }

  async loginComGoogle() {
    this.carregando = true;

    const usuario = await this.authService.loginComGoogle();

    this.carregando = false;

    if (usuario) {
      this.router.navigate(['/solicitacoes']);
    }
  }
}
