import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  @Input() title = '';

  isOffline = !navigator.onLine;

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

}
