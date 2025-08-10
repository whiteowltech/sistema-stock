import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-form.html',
  styleUrl: './stock-form.scss'
})
export class StockForm {

@Output() movimientoCreado = new EventEmitter<any>();

  form = {
    fecha: new Date().toISOString().split('T')[0],
    nombre: '',
    tipo: 'ingreso',
    cantidad: 1,
    comentario: ''
  };

  enviar() {
    if (!this.form.nombre || this.form.cantidad <= 0) {
      alert('Por favor completá todos los campos obligatorios.');
      return;
    }

    this.movimientoCreado.emit({ ...this.form });
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.form = {
      fecha: new Date().toISOString().split('T')[0],
      nombre: '',
      tipo: 'ingreso',
      cantidad: 1,
      comentario: ''
    };
  }
}