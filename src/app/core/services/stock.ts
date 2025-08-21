// src/app/core/services/stock.ts
import { Injectable } from '@angular/core';
import {
  // ===== Interfaces que debés tener en interfaces/stock.ts =====
  Modelo,
  Modulo,
  PiezaModelo,
  TipoModulo,                 // 'con_borde' | 'sin_borde'
  CategoriaItem,              // 'modulo' | 'plaqueta_carga' | 'tapa_trasera'
  Movimiento,
  MovimientoView,
  TIPO_MOD_LABEL,             // { con_borde: 'Módulo con borde', sin_borde: 'Módulo sin borde' }
} from '../../interfaces/stock';

@Injectable({ providedIn: 'root' })
export class StockService {

  // =========================
  // Etiquetas legibles básicas
  // =========================
  private readonly LABEL_PLAQUETA = 'Plaqueta de carga';
  private readonly LABEL_TAPA     = 'Tapa trasera';

  private labelModulo(tipo: TipoModulo) {
    // Si preferís no importar TIPO_MOD_LABEL, podés hardcodear acá
    return TIPO_MOD_LABEL[tipo] ?? '(?)';
  }

  private labelCategoriaItem(categoria: CategoriaItem, modulo?: Modulo): string {
    switch (categoria) {
      case 'modulo':
        return modulo ? this.labelModulo(modulo.tipo) : 'Módulo (?)';
      case 'plaqueta_carga':
        return this.LABEL_PLAQUETA;
      case 'tapa_trasera':
        return this.LABEL_TAPA;
      default:
        return '(?)';
    }
  }

  // =========================
  // Datos en memoria (mock)
  // =========================
  private modelos: Modelo[] = [
    {
      id: 1,
      nombre: 'iPhone 11',
      comentario: 'Línea 2019',
      modulos: [
        { id: 11, tipo: 'con_borde' },
        { id: 12, tipo: 'sin_borde' },
      ],
      plaquetas: [{ id: 101, categoria: 'plaqueta_carga' }],
      tapas:     [{ id: 201, categoria: 'tapa_trasera' }],
    },
    {
      id: 2,
      nombre: 'iPhone 13',
      modulos: [
        { id: 21, tipo: 'con_borde' },
        { id: 22, tipo: 'sin_borde' },
      ],
      plaquetas: [{ id: 102, categoria: 'plaqueta_carga' }],
      tapas:     [{ id: 202, categoria: 'tapa_trasera' }],
    },
    {
      id: 3,
      nombre: 'Samsung Galaxy S21',
      modulos: [
        { id: 31, tipo: 'con_borde' },
        { id: 32, tipo: 'sin_borde' },
      ],
      // este podría no tener plaquetas/tapas si querés
      plaquetas: [{ id: 103, categoria: 'plaqueta_carga' }],
      tapas:     [{ id: 203, categoria: 'tapa_trasera' }],
    },
  ];

  // Movimientos con items categorizados (modulo / plaqueta_carga / tapa_trasera)
  private movimientos: Movimiento[] = [
    {
      id: 1,
      fecha: '2025-08-01',
      modeloId: 1,
      tipo: 'ingreso',
      comentario: 'Compra inicial',
      items: [
        { categoria: 'modulo',         refId: 11,  cantidad: 5 }, // iPhone 11 con borde
        { categoria: 'modulo',         refId: 12,  cantidad: 3 }, // iPhone 11 sin borde
        { categoria: 'plaqueta_carga', refId: 101, cantidad: 2 },
      ],
    },
    {
      id: 2,
      fecha: '2025-08-05',
      modeloId: 1,
      tipo: 'egreso',
      comentario: 'Reparación',
      items: [
        { categoria: 'modulo', refId: 11, cantidad: 1 },
      ],
    },
    {
      id: 3,
      fecha: '2025-08-10',
      modeloId: 2,
      tipo: 'ingreso',
      comentario: 'Compra',
      items: [
        { categoria: 'modulo',         refId: 21,  cantidad: 4 },
        { categoria: 'modulo',         refId: 22,  cantidad: 2 },
        { categoria: 'tapa_trasera',   refId: 202, cantidad: 2 },
      ],
    },
    {
      id: 4,
      fecha: '2025-08-18',
      modeloId: 3,
      tipo: 'ingreso',
      comentario: 'Compra',
      items: [
        { categoria: 'modulo',         refId: 31,  cantidad: 6 },
        { categoria: 'plaqueta_carga', refId: 103, cantidad: 3 },
      ],
    },
  ];

  // =========================
  // Utilidades internas
  // =========================
  private nextModeloId(): number {
    return (this.modelos.length ? Math.max(...this.modelos.map(m => m.id)) : 0) + 1;
  }

  private nextIdSeed = Date.now();
  private nextAnyId(): number {
    return ++this.nextIdSeed;
  }

  private nextMovimientoId(): number {
    return (this.movimientos.length ? Math.max(...this.movimientos.map(m => m.id)) : 0) + 1;
  }

  private signo(tipo: Movimiento['tipo']) {
    return tipo === 'ingreso' ? +1 : -1;
  }

  // =========================
  // CRUD Modelos
  // =========================
  getModelos(): Modelo[] {
    return this.modelos;
  }

  getModelo(id: number): Modelo | undefined {
    return this.modelos.find(m => m.id === id);
  }

  /** Crear modelo: asigna id a módulos/plaquetas/tapas si faltan */
  createModelo(modelo: Modelo): Modelo {
    const id = this.nextModeloId();
    const newModelo: Modelo = {
      id,
      nombre: modelo.nombre,
      comentario: modelo.comentario,
      modulos: (modelo.modulos ?? []).map((m, i) => ({
        id: m.id ?? (this.nextAnyId() + i),
        tipo: m.tipo,
      })),
      plaquetas: (modelo.plaquetas ?? []).map((p, i) => ({
        id: p.id ?? (this.nextAnyId() + i),
        categoria: 'plaqueta_carga',
      })),
      tapas: (modelo.tapas ?? []).map((t, i) => ({
        id: t.id ?? (this.nextAnyId() + i),
        categoria: 'tapa_trasera',
      })),
    };
    this.modelos.push(newModelo);
    return newModelo;
  }

  /** Actualizar modelo: reemplaza definición (ids conservados si vienen) */
  updateModelo(modelo: Modelo): boolean {
    const idx = this.modelos.findIndex(m => m.id === modelo.id);
    if (idx === -1) return false;

    this.modelos[idx] = {
      id: modelo.id!,
      nombre: modelo.nombre,
      comentario: modelo.comentario,
      modulos: (modelo.modulos ?? []).map((m, i) => ({
        id: m.id ?? (this.nextAnyId() + i),
        tipo: m.tipo,
      })),
      plaquetas: (modelo.plaquetas ?? []).map((p, i) => ({
        id: p.id ?? (this.nextAnyId() + i),
        categoria: 'plaqueta_carga',
      })),
      tapas: (modelo.tapas ?? []).map((t, i) => ({
        id: t.id ?? (this.nextAnyId() + i),
        categoria: 'tapa_trasera',
      })),
    };
    return true;
  }

  // =========================
  // Stock por categoría
  // =========================
  /**
   * Devuelve el stock por refId para una categoría específica de un modelo.
   * Ej: categoria = 'modulo' => { [moduloId]: cantidad }
   */
  getStockMapByCategoria(modeloId: number, categoria: CategoriaItem): Record<number, number> {
    const acc: Record<number, number> = {};
    for (const mv of this.movimientos) {
      if (mv.modeloId !== modeloId) continue;
      const s = this.signo(mv.tipo);
      for (const it of mv.items) {
        if (it.categoria !== categoria) continue;
        acc[it.refId] = (acc[it.refId] ?? 0) + s * it.cantidad;
      }
    }
    return acc;
  }

  /**
   * Compat: mapa de stock SOLO para módulos (antes existía getStockMap(modeloId))
   * Retorna { [moduloId]: cantidad }
   */
  getStockMap(modeloId: number): Record<number, number> {
    return this.getStockMapByCategoria(modeloId, 'modulo');
  }

  // Helpers usados por la tabla de modelos
  qtyModulo(m: Modelo, tipo: TipoModulo): number {
    const map = this.getStockMapByCategoria(m.id, 'modulo');
    const mod = (m.modulos || []).find(mm => mm.tipo === tipo);
    return mod ? (map[mod.id] ?? 0) : 0;
  }

  /** Suma total de plaquetas (si hay varias entradas en el modelo) */
  qtyPlaqueta(m: Modelo): number {
    const map = this.getStockMapByCategoria(m.id, 'plaqueta_carga');
    return (m.plaquetas || []).reduce((sum, p) => sum + (map[p.id] ?? 0), 0);
  }

  /** Suma total de tapas traseras (si hay varias entradas en el modelo) */
  qtyTapa(m: Modelo): number {
    const map = this.getStockMapByCategoria(m.id, 'tapa_trasera');
    return (m.tapas || []).reduce((sum, t) => sum + (map[t.id] ?? 0), 0);
  }

  // =========================
  // Movimientos
  // =========================
  /** Alta de movimiento (no valida stock en egreso; podés sumarlo si querés) */
  createMovimiento(mov: Movimiento): Movimiento {
    const nuevo: Movimiento = { ...mov, id: this.nextMovimientoId() };
    this.movimientos.push(nuevo);
    return nuevo;
  }

  /**
   * Vista para listados: items con `concepto` legible y `cantidad`.
   * (El template de movimientos espera `items: { concepto, cantidad }[]`)
   */
  getMovimientosView(): MovimientoView[] {
    return this.movimientos
      .map(m => {
        const modelo = this.modelos.find(x => x.id === m.modeloId);

        const items = m.items.map(it => {
          // Buscar referencia según categoría
          let concepto = '(?)';

          if (it.categoria === 'modulo') {
            const mod = modelo?.modulos.find(mm => mm.id === it.refId);
            concepto = this.labelCategoriaItem('modulo', mod);
          } else if (it.categoria === 'plaqueta_carga') {
            // podrías distinguir por id si tenés más de una plaqueta
            concepto = this.LABEL_PLAQUETA;
          } else if (it.categoria === 'tapa_trasera') {
            // idem para tapas
            concepto = this.LABEL_TAPA;
          }

          return { concepto, cantidad: it.cantidad };
        });

        return {
          id: m.id,
          fecha: m.fecha,
          modelo: modelo?.nombre ?? '(?)',
          tipo: m.tipo,
          comentario: m.comentario,
          items,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
// — wrappers públicos, por si los querés llamar directo desde la tabla —
  getPlaquetaStock(modeloId: number): number {
    const modelo = this.getModelo(modeloId);
    if (!modelo?.plaquetas?.length) return 0;
    const map = this.getStockMapByCategoria(modeloId, 'plaqueta_carga');
    return modelo.plaquetas.reduce((acc, p) => acc + (map[p.id] ?? 0), 0);
  }

  getTapaStock(modeloId: number): number {
    const modelo = this.getModelo(modeloId);
    if (!modelo?.tapas?.length) return 0;
    const map = this.getStockMapByCategoria(modeloId, 'tapa_trasera');
    return modelo.tapas.reduce((acc, t) => acc + (map[t.id] ?? 0), 0);
  }
  
}
