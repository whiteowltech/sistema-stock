import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { Modelo, TipoModulo } from '../../../interfaces/stock';

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
modStock(m: Modelo) {
  const stockMap = this.stock.getStockMap(m.id);
  return m.modulos.map(mod => ({
    nombre: this.stock['nombreModulo'](mod), // texto derivado
    cantidad: stockMap[mod.id] ?? 0
  }));
}

  totalStock(modelo: Modelo): number {
    return this.modStock(modelo).reduce((acc, it) => acc + (it.cantidad || 0), 0);
  }
  qty(m: Modelo, tipo: TipoModulo, presentacionMl?: number): number {
  const map = this.stock.getStockMap(m.id); // { [moduloId]: cantidad }
  // buscá el módulo del modelo que matchee por tipo (+ presentacion si vino)
  const mod = (m.modulos || []).find(mm =>
    mm.tipo === tipo && ((mm.presentacionMl ?? 0) === (presentacionMl ?? 0))
  );
  if (!mod) return 0;
  return map[mod.id] ?? 0;
}
}

