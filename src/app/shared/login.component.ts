import { inject } from '@angular/core';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
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
      <hr style="margin:2rem 0;">
      <form [formGroup]="licenseForm" (ngSubmit)="guardarLicencia()">
        <input type="text" formControlName="licenseId" placeholder="Licencia" required />
        <button type="submit">Ingresar licencia</button>
      </form>
      <div *ngIf="licSaved" style="color:green;text-align:center;margin-top:1rem;">Licencia guardada correctamente</div>
      <div *ngIf="licenseActual" style="margin-top:1rem;text-align:center;">
        <span style="color:#222">Licencia actual:</span>
        <span style="font-weight:bold;color:#22d3ee">{{ licenseActual }}</span>
        <button type="button" (click)="borrarLicencia()" style="margin-left:10px;padding:2px 8px;border-radius:4px;background:#c02626;color:#fff;border:none;">Borrar</button>
      </div>
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
  public router: Router;
  form: FormGroup;
  error = false;

  licSaved = false;
  licenseForm: FormGroup;
  licenseActual: string | null = null;

  constructor(private fb: FormBuilder) {
    this.router = inject(Router);
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
    this.licenseForm = this.fb.group({
      licenseId: ['', Validators.required],
    });
    this.licenseActual = localStorage.getItem('licenseId');
  }

  login() {
    const { usuario, contrasena } = this.form.value;
    if (usuario === 'Lucas' && contrasena === 'Lucas2025') {
      localStorage.setItem('logueado', '1');
      this.router.navigate(['/modelos']);
    } else {
      this.error = true;
    }
  }

  guardarLicencia() {
    const { licenseId } = this.licenseForm.value;
    localStorage.setItem('licenseId', licenseId);
    this.licenseActual = licenseId;
    this.licSaved = true;
    setTimeout(() => this.licSaved = false, 2000);
  }

  borrarLicencia() {
    localStorage.removeItem('licenseId');
    this.licenseActual = null;
    this.licenseForm.reset();
  }
}
