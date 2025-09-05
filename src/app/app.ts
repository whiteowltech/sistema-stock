import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DbModalComponent } from './components/db-modal/db-modal';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DbModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = signal('stock-app');
  public showDbModal = false;
}
