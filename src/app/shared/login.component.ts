import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar sesión</h2>
      <form [formGroup]="form" (ngSubmit)="login()">
        <input type="text" formControlName="usuario" placeholder="Usuario" required />
        <input type="password" formControlName="contrasena" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <div *ngIf="error" class="error">Usuario o contraseña incorrectos</div>
    </div>
  `,
  styles: [`
    .login-container { max-width: 320px; margin: 60px auto; padding: 2rem; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px #0002; }
    h2 { text-align: center; margin-bottom: 1.5rem; }
    input { width: 100%; margin-bottom: 1rem; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; }
    button { width: 100%; padding: 0.7rem; border: none; border-radius: 4px; background: #222; color: #fff; font-weight: bold; }
    .error { color: #c00; text-align: center; margin-top: 1rem; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  error = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
  }

  login() {
    const { usuario, contrasena } = this.form.value;
    if (usuario === 'Lucas' && contrasena === 'Lucas2025') {
      localStorage.setItem('logueado', '1');
      window.location.reload();
    } else {
      this.error = true;
    }
  }
}
