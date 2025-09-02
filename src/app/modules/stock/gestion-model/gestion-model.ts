import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormGroup
} from '@angular/forms';

import { StockService } from '../../../core/services/stock';
import { Modelo, Modulo, TipoModulo } from '../../../interfaces/stock';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-model.html',
  styleUrls: ['./gestion-model.scss'],
})
export class GestionModelComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef as any) as ChangeDetectorRef;
  private route = inject(ActivatedRoute);
  submitted = false;
  errorMsg = '';
  successMsg = '';
  saving = false;
  private stock = inject(StockService);
  private modelos: Modelo[] = [];
  modelosSignal = signal<Modelo[]>([]);


  private fb = inject(FormBuilder);
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  form = this.fb.group({
    id: [''],  // hidden field for edit mode
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipoOperacion: ['ingreso', Validators.required],
    comentario: ['', Validators.maxLength(300)],
    items: this.fb.array([
      this.fb.group({
        tipo: ['con_borde'],
        cantidad: ['0'],
        precio_costo: ['0'],
        precio_venta: ['0'],
      }),
      this.fb.group({
        tipo: ['sin_borde'],
        cantidad: ['0'],
        precio_costo: ['0'],
        precio_venta: ['0'],
      }),
      this.fb.group({
        tipo: ['plaqueta_carga'],
        cantidad: ['0'],
        precio_costo: ['0'],
        precio_venta: ['0'],
      }),
      this.fb.group({
        tipo: ['tapa_trasera'],
        cantidad: ['0'],
        precio_costo: ['0'],
        precio_venta: ['0'],
      }),
    ]),
  });
  editMode = false;

  async ngOnInit(): Promise<void> {
    // Obtener modelos correctamente desde el servicio
    this.modelos = await firstValueFrom(this.stock.getModelos());
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      window.location.href = '/stock';
      return;
    }
    const modelo = this.modelos.find(m => m.id === id);
    if (modelo) {
      this.form.patchValue({
        id: modelo.id,
        nombre: modelo.nombre,
        comentario: '',
        tipoOperacion: 'ingreso',
      });
    }
  }
  get itemsFA(): FormGroup[] {
    return (this.form.get('items') as FormArray).controls as FormGroup[];
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.saving = true;
      // Solo crear el movimiento de stock
      const modeloId = this.route.snapshot.paramMap.get('id') ?? '';
      const tipo: 'ingreso' | 'egreso' = (this.form.value.tipoOperacion === 'egreso') ? 'egreso' : 'ingreso';
      const movimiento = {
        tipo,
        comentario: this.form.value.comentario ?? '',
        fecha: new Date().toISOString(),
        items: this.itemsFA.map(item => ({
          categoria: item.value.tipo,
          cantidad: String(item.value.cantidad),
          precio_costo: String(item.value.precio_costo),
          precio_venta: String(item.value.precio_venta),
        })),
      };
      this.stock.addMovimiento(modeloId, movimiento).subscribe({
        next: (res) => {
          this.successMsg = 'Movimiento guardado correctamente';
          this.saving = false;
          this.form.reset();
          this.submitted = false;
          setTimeout(() => {
            this.successMsg = '';
            this.cdr.detectChanges();
            window.location.reload();
          }, 2000);
        },
        error: (error) => {
          this.errorMsg = error.error?.error || 'Error al guardar el movimiento';
          this.saving = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.errorMsg = '';
            this.cdr.detectChanges();
            window.location.reload();
          }, 2000);
          setTimeout(() => {
            this.errorMsg = '';
          }, 100);
        }
      });
    } else {
      this.saving = false;
    }
  }
}



