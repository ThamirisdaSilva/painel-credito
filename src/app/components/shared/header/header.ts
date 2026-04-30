// src/app/components/shared/header/header.ts

import { Component, HostListener, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Input() title = '';

  isOffline = !navigator.onLine;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false;
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true;
  }

  estaNaTelaLogin() {
    return this.router.url === '/login';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
