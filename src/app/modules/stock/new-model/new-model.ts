import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { Modelo } from '../../../interfaces/stock';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-model.html',
  styleUrls: ['./new-model.scss'],
})
export class NewModelComponent {
  modelo: Modelo = {
    id: '',
    nombre: '',
    comentario: '',
    items: [
      { id: '1', tipo: 'con_borde', cantidad: '0', precio_costo: '0', precio_venta: '0' },
      { id: '2', tipo: 'sin_borde', cantidad: '0', precio_costo: '0', precio_venta: '0' },
      { id: '3', tipo: 'plaqueta_carga', cantidad: '0', precio_costo: '0', precio_venta: '0' },
      { id: '4', tipo: 'tapa_trasera', cantidad: '0', precio_costo: '0', precio_venta: '0' },
    ],
  };
  tipoMovimiento: 'ingreso' | 'egreso' = 'ingreso';
  errorMsg = '';
  successMsg = '';
  saving = false;

  constructor(private stock: StockService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    this.saving = true;
    if (!this.modelo.nombre || this.modelo.nombre.length > 80) {
      this.errorMsg = 'El nombre es obligatorio y debe tener menos de 80 caracteres.';
      this.saving = false;
      return;
    }
    for (const item of this.modelo.items) {
      if (Number(item.cantidad) < 0) {
        this.errorMsg = 'La cantidad debe ser mayor o igual a 0.';
        this.saving = false;
        return;
      }
    }
    // Enviar tipoMovimiento junto con el modelo si el backend lo requiere
    const payload = { ...this.modelo, tipoMovimiento: this.tipoMovimiento };
    console.log('Payload to submit:', payload);
    this.stock.addModelo(payload).subscribe({
      next: () => {
        this.successMsg = 'Modelo creado correctamente';
        this.saving = false;
        this.cleanForm();
        // this.router.navigate(['/stock']);
      },
      error: () => {
        this.errorMsg = 'Error al crear el modelo';
        this.saving = false;
      }
    });
  }
  cleanForm() {
    this.modelo = {
      id: '',
      nombre: '',
      comentario: '',
      items: [
        { id: '1', tipo: 'con_borde', cantidad: '0', precio_costo: '0', precio_venta: '0' },
        { id: '2', tipo: 'sin_borde', cantidad: '0', precio_costo: '0', precio_venta: '0' },
        { id: '3', tipo: 'plaqueta_carga', cantidad: '0', precio_costo: '0', precio_venta: '0' },
        { id: '4', tipo: 'tapa_trasera', cantidad: '0', precio_costo: '0', precio_venta: '0' },
      ],
    };
    this.cdr.detectChanges(); // Forzar actualización del template
  }
}
