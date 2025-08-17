import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink  } from '@angular/router';

import { StockService } from '../../../core/services/stock';
import { Modelo, TipoModulo, PresentacionMl } from '../../../interfaces/stock';

type ModDef = { tipo: TipoModulo; presentacionMl?: PresentacionMl };

// catálogo fijo de filas a mostrar SIEMPRE


@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-model.html',
  styleUrls: ['./new-model.scss'],
})
export class NewModelComponent implements OnInit {
  // Inyecciones
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stock = inject(StockService);

  cols = [
    { tipo: 'pegamento' as const,             label: 'Pegamento' },
    { tipo: 'plaqueta_carga' as const,        label: 'Plaqueta de carga' },
    { tipo: 'alcohol_isopropilico' as const,  presentacionMl: 1000 as const, label: 'Alcohol 1 L' },
    { tipo: 'alcohol_isopropilico' as const,  presentacionMl: 500  as const, label: 'Alcohol 500 ml' },
    { tipo: 'alcohol_isopropilico' as const,  presentacionMl: 250  as const, label: 'Alcohol 250 ml' },
    { tipo: 'tapa_trasera' as const,          label: 'Tapa trasera' },
    { tipo: 'pantalla' as const,              label: 'Pantalla / display' },
  ];
  // estado
  loading = signal(true);
  modelos = signal<Modelo[]>([]);

  // Estado UI
  saving = signal(false);
  submitted = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Modo edición
  editMode = signal(false);
  modelId = signal<number | null>(null);

  // Formulario
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipoOperacion: ['ingreso', [Validators.required]], // solo se usa en alta
    comentario: ['', [Validators.maxLength(300)]],
    modules: this.fb.array<FormGroup>([])
  });

  get modulesFA(): FormArray<FormGroup> {
    return this.form.get('modules') as FormArray<FormGroup>;
  }

  // =======================
  // Ciclo de vida
  // =======================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.editMode.set(true);
      this.modelId.set(id);
      this.loadAndEnsureAll(id);      // 👈 en edición: 7 filas con stock/0
    } else {
      this.ensureAllRowsWithZeros();  // 👈 en alta: 7 filas en 0
    }
    this.modelos.set(this.stock.getModelos());
    this.loading.set(false);
  }

  // =======================
  // Helpers de filas
  // =======================
  /** Crea una fila del FormArray de módulos (tipo/presentación bloqueados) */
  private createModuleRow(
    tipo: TipoModulo,
    presentacion: PresentacionMl | null,
    cantidad: number,
    id?: number | null,
  ): FormGroup {
    const group = this.fb.group({
      id: new FormControl<number | null>(id ?? null),
      tipo: new FormControl<TipoModulo>(tipo, { nonNullable: true, validators: [Validators.required] }),
      presentacionMl: new FormControl<PresentacionMl | null>(presentacion),
      cantidad: new FormControl<number>(cantidad, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
    });

    // ⚠️ Bloqueamos tipo/presentación siempre (alta y edición).
    group.get('tipo')?.disable({ emitEvent: false });
    group.get('presentacionMl')?.disable({ emitEvent: false });

    return group;
  }

  /** Alta: llenar SIEMPRE todas las filas, cantidad = 0 */
  private ensureAllRowsWithZeros() {
    this.modulesFA.clear();
    for (const def of this.cols) {
      this.modulesFA.push(this.createModuleRow(def.tipo, def.presentacionMl ?? null, 0, null));
    }
  }

  /** Edición: crear las 7 filas; si falta alguna, va en 0 */
  private loadAndEnsureAll(id: number) {
    this.saving.set(true);

    const editable = this.stock.getModeloForEdit(id); // { id, nombre, modulos: [{ id, tipo, presentacionMl?, cantidad }] }
    if (!editable) {
      this.errorMsg.set('No se pudo cargar el modelo');
      this.saving.set(false);
      return;
    }

    this.form.patchValue({
      nombre: editable.nombre,
      comentario: (editable as any).comentario ?? ''
    });

    // Indexar por tipo/presentación para leer cantidad rápida
    const qtyByKey = new Map<string, number>();
    const idByKey = new Map<string, number>();
    for (const mm of editable.modulos) {
      const key = `${mm.tipo}|${mm.presentacionMl ?? 0}`;
      qtyByKey.set(key, typeof mm.cantidad === 'number' ? mm.cantidad : 0);
      if (typeof mm.id === 'number') idByKey.set(key, mm.id);
    }

    this.modulesFA.clear();
    for (const def of this.cols) {
      const key = `${def.tipo}|${def.presentacionMl ?? 0}`;
      const cant = qtyByKey.get(key) ?? 0;
      const realId = idByKey.get(key) ?? null;
      this.modulesFA.push(this.createModuleRow(def.tipo, def.presentacionMl ?? null, cant, realId));
    }

    this.saving.set(false);
  }

  // =======================
  // Serialización (payload)
  // =======================
  private toPayload(): Modelo {
    // getRawValue() incluye disabled (tipo/presentación)
    const raw = this.form.getRawValue() as {
      nombre: string;
      comentario?: string;
      tipoOperacion: 'ingreso' | 'egreso';
      modules: Array<{
        id: number | null;
        tipo: TipoModulo;                // llega por getRawValue aunque esté disabled
        presentacionMl: PresentacionMl | null;
        cantidad: number;                // si luego la usás para movimientos
      }>;
    };

    return {
      id: this.modelId() ?? undefined,
      nombre: (raw.nombre || '').trim(),
      comentario: (raw.comentario || '').trim(),
      // En Modelo persistimos solo la definición (sin cantidad)
      modulos: raw.modules.map(m => ({
        id: m.id ?? undefined,
        tipo: m.tipo,
        presentacionMl: m.presentacionMl ?? undefined
      }))
    } as Modelo;
  }

  // =======================
  // Submit
  // =======================
  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const payload = this.toPayload();

      if (this.editMode()) {
        const ok = this.stock.updateModelo(payload);
        if (!ok) {
          this.errorMsg.set('No se pudo actualizar el modelo ❌');
        } else {
          this.successMsg.set('Modelo actualizado correctamente ✅');
        }
      } else {
        this.stock.createModelo(payload);
        this.successMsg.set('Modelo guardado correctamente ✅');
      }

      setTimeout(() => this.successMsg.set(null), 2500);
      setTimeout(() => this.errorMsg.set(null), 3500);
    } catch (e) {
      console.error(e);
      this.errorMsg.set('Error al guardar el modelo');
      setTimeout(() => this.errorMsg.set(null), 3500);
    } finally {
      this.saving.set(false);
    }
  }
  qty(m: Modelo, tipo: TipoModulo, presentacionMl?: PresentacionMl): number {
    const map = this.stock.getStockMap(m.id);
    const mod = (m.modulos || []).find(mm =>
      mm.tipo === tipo && ((mm.presentacionMl ?? 0) === (presentacionMl ?? 0))
    );
    return mod ? (map[mod.id] ?? 0) : 0;
  }
}
