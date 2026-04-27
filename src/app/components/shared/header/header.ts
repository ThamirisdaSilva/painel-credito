import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title = '';

  isOffline = !navigator.onLine;

  constructor(
    public authService: AuthService,
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
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
