import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-model.html',
  styleUrls: ['./new-model.scss'],
})
export class NewModelComponent implements OnInit {
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
    this.modelos = await firstValueFrom(this.stock.getModelos());
    // Detectar si hay id en la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const modelo = this.modelos.find(m => m.id === id);
      if (modelo) {
        this.editMode = true;
        this.form.patchValue({
          id: modelo.id,
          nombre: modelo.nombre,
          comentario: modelo.comentario ?? '',
          tipoOperacion: 'ingreso', // o lo que corresponda
        });
        // Cargar los módulos en el FormArray asegurando el orden y sin repeticiones
        const itemsFA = this.form.get('items') as import('@angular/forms').FormArray;
        const tipos: TipoModulo[] = ['con_borde', 'sin_borde', 'plaqueta_carga', 'tapa_trasera'];
        tipos.forEach((tipo, idx) => {
          const item = modelo.items.find(i => i.tipo === tipo);
          if (itemsFA.at(idx)) {
            itemsFA.at(idx).patchValue({
              tipo,
              cantidad: item?.cantidad ?? '0',
              precio_costo: item?.precio_costo ?? '0',
              precio_venta: item?.precio_venta ?? '0',
            });
          }
        });
      }
    }
  }
get itemsFA(): FormGroup[] {
  return (this.form.get('items') as FormArray).controls as FormGroup[];
}
  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.saving = true;
      // Armar el array items para el payload (sin id)
      const items: any[] = (this.form.get('items')?.value as any[]).map(item => ({
        tipo: item.tipo,
        cantidad: String(item.cantidad ?? '0'),
        precio_costo: String(item.precio_costo ?? '0'),
        precio_venta: String(item.precio_venta ?? '0'),
      }));
      const payload = {
        nombre: this.form.value.nombre ?? '',
        comentario: this.form.value.comentario ?? '',
        items,
        tipoMovimiento: this.form.value.tipoOperacion,
        comentarioMovimiento: this.form.value.comentario ?? '',
        fechaMovimiento: new Date().toISOString()
      };
      const modeloEdit: Modelo = {
        id: this.form.value.id ?? '',
        nombre: this.form.value.nombre ?? '',
        comentario: this.form.value.comentario ?? '',
        items,
      };
      if (this.editMode) {
        this.stock.updateModelo(modeloEdit).subscribe({
          next: () => {
            this.successMsg = 'Modelo actualizado correctamente';
            this.saving = false;
            this.form.reset();
            this.submitted = false;
            window.location.href = '/stock';
          },
          error: err => {
            this.errorMsg = 'Error al actualizar el modelo';
            this.saving = false;
          }
        });
        console.log('Modelo actualizado:', modeloEdit);
      } else {
        this.stock.addModelo(payload).subscribe({
          next: () => {
            this.successMsg = 'Modelo creado correctamente';
            this.saving = false;
            this.form.reset();
            this.submitted = false;
            // window.location.href = '/stock';
          },
          error: err => {
            this.errorMsg = 'Error al crear el modelo';
            this.saving = false;
          }
        });
        console.log('Modelo creado:', payload);
      }
    } else {
      this.saving = false;
    }
  }
}



