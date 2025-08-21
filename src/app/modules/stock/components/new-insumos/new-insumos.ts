// src/app/features/insumos/new-insumos/new-insumos.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';


import { InsumosService } from '../../../../core/services/insumos';
import { TIPO_INSUMO_LABEL } from '../../../../interfaces/stock';

@Component({
  selector: 'app-new-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-insumos.html',
  styleUrls: ['./new-insumos.scss'],
})
export class NewInsumosComponent {
  private fb = inject(FormBuilder);
  private insumosSrv = inject(InsumosService);
  private router = inject(Router);

  // UI state
  saving = signal(false);
  submitted = signal(false); 
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // opciones del select
  insumos = this.insumosSrv.getInsumos();
  label = TIPO_INSUMO_LABEL;

  // formulario
  form = this.fb.group({
    tipo: this.fb.control<'ingreso' | 'egreso'>('ingreso', { nonNullable: true, validators: [Validators.required] }),
    insumoId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    cantidad: this.fb.control<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    comentario: this.fb.control<string>('', { nonNullable: true }),
  });

  // submit
  onSubmit() {
    if (this.form.invalid) return;
    this.submitted.set(true); 
    if (this.form.invalid) {
      this.form.markAllAsTouched();             // 👈 muestra errores
      return;
    }
    const { tipo, insumoId, cantidad, comentario } = this.form.getRawValue();
    if (!insumoId || !cantidad || !tipo) return;

    try {
      this.saving.set(true);

      // Registramos movimiento: el service aplica el signo según 'tipo'
      this.insumosSrv.createMovimiento({
        fecha: new Date().toISOString().slice(0, 10),
        tipo, // 'ingreso' | 'egreso'
        comentario: comentario ?? '',
        items: [{ insumoId, cantidad }],
      });

      this.successMsg.set('Movimiento de insumo registrado ✅');
      // reset básico
      this.form.reset({ tipo: 'ingreso', insumoId: null, cantidad: 1, comentario: '' });
      setTimeout(() => this.successMsg.set(null), 2500);

      // opcional: navegar a una lista de insumos
      // this.router.navigate(['/insumos']);
    } catch (e) {
      console.error(e);
      this.errorMsg.set('No se pudo registrar el movimiento');
      setTimeout(() => this.errorMsg.set(null), 3500);
    } finally {
      this.saving.set(false);
    }
  }
  setSuccess(msg: string) {
    this.successMsg.set(msg);
    this.errorMsg.set('');
    setTimeout(() => this.successMsg.set(''), 4000); // 👈 se borra a los 4s
  }

  setError(msg: string) {
    this.errorMsg.set(msg);
    this.successMsg.set('');
    setTimeout(() => this.errorMsg.set(''), 4000); // 👈 se borra a los 4s
  }

}
