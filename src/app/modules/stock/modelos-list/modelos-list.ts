import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { Modelo } from '../../../interfaces/stock';

@Component({
  selector: 'app-modelos-list',
  imports: [ RouterLink],
  templateUrl: './modelos-list.html',
  styleUrl: './modelos-list.scss'
})

export class ModelosList implements OnInit {
  private stock = inject(StockService);

  modelos = signal<Modelo[]>([]);
  loading = signal(true);

  ngOnInit() {
    // Servicio en memoria (sincrónico)
    this.modelos.set(this.stock.getModelos());
    this.loading.set(false);
  }

  // Devuelve pares { nombre, cantidad } por módulo del modelo
  modStock(modelo: Modelo): { nombre: string; cantidad: number }[] {
    const map = this.stock.getStockMap(modelo.id); // { moduloId: cantidad }
    return (modelo.modulos || []).map(mod => ({
      nombre: mod.nombre,
      cantidad: map[mod.id] ?? 0
    }));
  }

  totalStock(modelo: Modelo): number {
    return this.modStock(modelo).reduce((acc, it) => acc + (it.cantidad || 0), 0);
  }
}

