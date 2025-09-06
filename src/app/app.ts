import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DbModalComponent } from './components/db-modal/db-modal';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './shared/login.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DbModalComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = signal('stock-app');
  public showDbModal = false;
  get logueado() {
    return localStorage.getItem('logueado') === '1';
  }

  public router = inject(Router);
  logout() {
    localStorage.removeItem('logueado');
    this.router.navigate(['/login']);
  }
}
