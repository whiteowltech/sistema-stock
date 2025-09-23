import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { StockService } from '../../../core/services/stock';
import { Modelo } from '../../../interfaces/stock';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-model',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-model.html',
  styleUrls: ['./update-model.scss'],
})
export class UpdateModelComponent implements OnInit {
  modelo: Modelo | null = {
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

  constructor(
    private stock: StockService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const modelo = await firstValueFrom(this.stock.getModelo(id));
      if (modelo) {
        const { id, nombre, items } = modelo;
        items.forEach(item => {
          item.cantidad = "0";
          item.precio_costo = "0";
          item.precio_venta = "0";
        });
        this.modelo = { id, nombre, items };
        this.cdr.detectChanges(); // Forzar actualización del template
      } else {
        this.errorMsg = 'No se encontró el modelo.';
      }
    } else {
      this.errorMsg = 'No se especificó el modelo a editar.';
    }
  }

  onSubmit() {
    if (!this.modelo) return;
    this.saving = true;
    // Enviar tipoMovimiento junto con el modelo si el backend lo requiere
    const {comentario, items } = this.modelo;
    const payload = {tipo: this.tipoMovimiento, comentario, items };
    this.stock.addMovimiento(this.modelo.id, payload).subscribe({
      next: () => {
        this.successMsg = 'Modelo actualizado correctamente';
        this.saving = false;
        this.cleanForm();
        this.router.navigate(['/modelos']);
      },
      error: (e) => {
        this.errorMsg = e.error.error;
        this.saving = false;
        this.forceUpdate();
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
    this.forceUpdate();
  }
  forceUpdate() {
    this.cdr.detectChanges();
}
}



