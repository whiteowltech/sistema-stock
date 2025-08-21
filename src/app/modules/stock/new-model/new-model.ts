import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { StockService } from '../../../core/services/stock';
import { Modelo, TipoModulo } from '../../../interfaces/stock';

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-model.html',
  styleUrls: ['./new-model.scss'],
})
export class NewModelComponent implements OnInit {
  // Inyecciones
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stock = inject(StockService);

  // Estado UI
  loading = signal(true);
  saving = signal(false);
  submitted = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Modo edición
  editMode = signal(false);
  modelId = signal<number | null>(null);

  // Variantes fijas para cualquier modelo
  private readonly FIXED_TYPES: Array<TipoModulo> = ['con_borde', 'sin_borde'];

  // Formulario
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipoOperacion: ['ingreso', [Validators.required]], // solo en alta (si quisieras registrar un movimiento inicial)
    comentario: ['', [Validators.maxLength(300)]],

    // 3 bloques fijos
    modules: this.fb.array<FormGroup>([]),   // 2 filas: con_borde / sin_borde
    plaquetas: this.fb.array<FormGroup>([]), // 1 fila
    tapas: this.fb.array<FormGroup>([]),     // 1 fila
  });

  // Getters de FormArray
  get modulesFA(): FormArray<FormGroup>   { return this.form.get('modules') as FormArray<FormGroup>; }
  get plaquetasFA(): FormArray<FormGroup> { return this.form.get('plaquetas') as FormArray<FormGroup>; }
  get tapasFA(): FormArray<FormGroup>     { return this.form.get('tapas') as FormArray<FormGroup>; }

  // =======================
  // Ciclo de vida
  // =======================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = +idParam;
      this.editMode.set(true);
      this.modelId.set(id);
      this.loadAndEnsureBlocks(id);   // edición: crea 2+1+1 filas con cantidad (0 si no hay)
    } else {
      this.editMode.set(false);
      this.ensureAllBlocksWithZeros(); // alta: crea 2+1+1 filas en 0
    }

    this.loading.set(false);
  }

  // =======================
  // Helpers de filas
  // =======================

  /** Crea fila para módulos (con_borde/sin_borde) */
  private createModuleRow(
    tipo: TipoModulo,
    cantidad: number,
    id?: number | null,
  ): FormGroup {
    const g = this.fb.group({
      id: new FormControl<number | null>(id ?? null),
      tipo: new FormControl<TipoModulo>(tipo, { nonNullable: true, validators: [Validators.required] }),
      cantidad: new FormControl<number>(
        cantidad,
        { nonNullable: true, validators: [Validators.required, Validators.min(this.editMode() ? 0 : 1)] }
      ),
    });
    // tipo no es editable (siempre fijo en este flujo)
    g.get('tipo')?.disable({ emitEvent: false });
    return g;
  }

  /** Crea fila para plaquetas/tapas (solo cantidad + id) */
  private createSimpleRow(
    cantidad: number,
    id?: number | null
  ): FormGroup {
    return this.fb.group({
      id: new FormControl<number | null>(id ?? null),
      cantidad: new FormControl<number>(
        cantidad,
        { nonNullable: true, validators: [Validators.required, Validators.min(this.editMode() ? 0 : 1)] }
      ),
    });
  }

  /** Alta: llenar SIEMPRE los 3 bloques en 0 (2+1+1 filas) */
  private ensureAllBlocksWithZeros(): void {
    this.modulesFA.clear();
    this.plaquetasFA.clear();
    this.tapasFA.clear();

    // 2 módulos fijos
    for (const t of this.FIXED_TYPES) {
      this.modulesFA.push(this.createModuleRow(t, 0, null));
    }
    // 1 fila de plaquetas
    this.plaquetasFA.push(this.createSimpleRow(0, null));
    // 1 fila de tapas
    this.tapasFA.push(this.createSimpleRow(0, null));
  }

  /** Edición: carga el modelo y asegura 2+1+1 filas, usando 0 si faltan */
  private loadAndEnsureBlocks(id: number): void {
    this.saving.set(true);

    const modelo = this.stock.getModelo(id);
    if (!modelo) {
      this.errorMsg.set('No se encontró el modelo');
      this.saving.set(false);
      return;
    }

    // nombre/comentario
    this.form.patchValue({
      nombre: modelo.nombre,
      comentario: (modelo as any).comentario ?? ''
    });

    // MÓDULOS (con/sin): indexo por tipo
    const byTipo = new Map<TipoModulo, { id: number }>();
    for (const mm of (modelo.modulos ?? [])) {
      if (mm.tipo === 'con_borde' || mm.tipo === 'sin_borde') {
        byTipo.set(mm.tipo, { id: mm.id });
      }
    }

    // En este punto, si manejás el stock de módulos por movimientos, podrías:
    // const stockMap = this.stock.getStockMap(id); // { [moduloId]: qty }
    // y setear cantidades reales. Si no, dejamos 0 por defecto.

    this.modulesFA.clear();
    for (const t of this.FIXED_TYPES) {
      const mod = byTipo.get(t);
      const qty = 0; // reemplazá por stock real si ya lo calculás
      this.modulesFA.push(this.createModuleRow(t, qty, mod?.id ?? null));
    }

    // PLAQUETAS
    this.plaquetasFA.clear();
    if ((modelo as any).plaquetas?.length) {
      // si ya tenés id de plaquetas, respétalo
      const first = (modelo as any).plaquetas[0];
      this.plaquetasFA.push(this.createSimpleRow(0, first?.id ?? null));
    } else {
      this.plaquetasFA.push(this.createSimpleRow(0, null));
    }

    // TAPAS
    this.tapasFA.clear();
    if ((modelo as any).tapas?.length) {
      const first = (modelo as any).tapas[0];
      this.tapasFA.push(this.createSimpleRow(0, first?.id ?? null));
    } else {
      this.tapasFA.push(this.createSimpleRow(0, null));
    }

    this.saving.set(false);
  }

  // =======================
  // Serialización
  // =======================
  /** Serializa el form a Modelo (solo definición; las cantidades son para UI o movimiento inicial si querés) */
  private toPayload(): Modelo {
    const raw = this.form.getRawValue() as {
      nombre: string;
      comentario?: string;
      tipoOperacion: 'ingreso' | 'egreso';
      modules: Array<{ id: number | null; tipo: TipoModulo; cantidad: number }>;
      plaquetas: Array<{ id: number | null; cantidad: number }>;
      tapas: Array<{ id: number | null; cantidad: number }>;
    };

    return {
      id: this.modelId() ?? undefined,
      nombre: (raw.nombre || '').trim(),
      comentario: (raw.comentario || '').trim(),

      // Persistimos SOLO la definición (ids/tipos), no las cantidades
      modulos: raw.modules.map(m => ({
        id: m.id ?? undefined,
        tipo: m.tipo,
      })),

      // En estos dos, sólo los ids (la cantidad la manejarás por movimientos si corresponde)
      plaquetas: raw.plaquetas.map(p => ({
        id: p.id ?? undefined,
      })),

      tapas: raw.tapas.map(t => ({
        id: t.id ?? undefined,
      })),
    } as unknown as Modelo; // ← si tu interfaz ya tiene plaquetas/tapas, quitá el 'unknown as'
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
        const ok = this.stock.updateModelo(payload as any);
        if (!ok) {
          this.errorMsg.set('No se pudo actualizar el modelo ❌');
        } else {
          this.successMsg.set('Modelo actualizado correctamente ✅');
        }
      } else {
        this.stock.createModelo(payload as any);
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
}
