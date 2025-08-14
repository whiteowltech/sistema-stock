import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { Modelo } from '../../../interfaces/stock';

// Payload usado para crear/editar (incluye id opcional)
interface ModeloPayload {
  id?: number | null;
  nombre: string;
  comentario?: string;
  modules: { id?: number; nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-new-model',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './new-model.html',
  styleUrls: ['./new-model.scss'],
})
export class NewModelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stock = inject(StockService);

  // Estado
  saving = signal(false);
  submitted = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Modo edición
  editMode = signal(false);
  modelId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipoOperacion: ['ingreso', [Validators.required]], // se oculta en edición
    comentario: ['', [Validators.maxLength(300)]],
    modules: this.fb.array<FormGroup>([])
  });

  get modulesFA(): FormArray<FormGroup> {
    return this.form.get('modules') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode.set(true);
      const id = +idParam;
      this.modelId.set(id);
      this.loadModel(id);
    }
  }

  // Cargar modelo existente y poblar el form
  private loadModel(id: number) {
    this.saving.set(true);

    // Si agregaste getModeloForEdit (con cantidades), usalo:
    const editable = (this.stock as any).getModeloForEdit?.(id);

    if (editable) {
      // Con cantidades actuales por módulo
      this.form.patchValue({
        nombre: editable.nombre || '',
        comentario: (editable as any).comentario || ''
      });
      this.modulesFA.clear();
      (editable.modulos || []).forEach((mod: any) =>
        this.modulesFA.push(this.createModuleRow(mod.nombre, mod.cantidad ?? null, mod.id))
      );
      this.saving.set(false);
      return;
    }

    // Si no existe getModeloForEdit, cargar el modelo simple
    const m = this.stock.getModelo(id);
    if (!m) {
      this.errorMsg.set('No se pudo cargar el modelo');
      this.saving.set(false);
      return;
    }

    this.form.patchValue({
      nombre: m.nombre || '',
      comentario: (m as any).comentario || ''
    });
    this.modulesFA.clear();
    // Tu interfaz Modelo original no trae 'cantidad' en modulos,
    // así que las dejo vacías (el usuario puede ajustar).
    (m.modulos || []).forEach(mod =>
      this.modulesFA.push(this.createModuleRow(mod.nombre, null, mod.id))
    );

    this.saving.set(false);
  }

  private createModuleRow(nombre = '', cantidad: number | null = null, id?: number): FormGroup {
    // Se guarda el id del módulo si existe (para update limpio)
    return this.fb.group({
      id: new FormControl<number | null>(id ?? null),
      nombre: new FormControl(nombre, [Validators.required, Validators.maxLength(80)]),
      cantidad: new FormControl<number | null>(cantidad, [Validators.required, Validators.min(1)])
    });
  }

  addModule() { this.modulesFA.push(this.createModuleRow()); }
  removeModule(i: number) { this.modulesFA.removeAt(i); }

  private hasAtLeastOneModule(): boolean {
    return this.modulesFA.length > 0;
  }

  private toPayload(): ModeloPayload {
    const raw = this.form.getRawValue();
    return {
      id: this.modelId(),
      nombre: (raw.nombre || '').trim(),
      comentario: (raw.comentario || '').trim(),
      // Mantengo id de módulo si está, y cantidad numérica
      modules: (raw.modules || []).map((m: any) => ({
        id: m.id ?? undefined,
        nombre: (m.nombre || '').trim(),
        cantidad: Number(m.cantidad) || 0
      }))
    };
  }

  onSubmit() {
    this.submitted.set(true);
    if (!this.hasAtLeastOneModule() || this.form.invalid) return;

    this.saving.set(true);
    try {
      const payload = this.toPayload();

      if (this.editMode()) {
        // actualizar (sin await/Observable)
        const ok = this.stock.updateModelo({
          id: payload.id!,
          nombre: payload.nombre,
          modulos: payload.modules.map(mm => ({ id: mm.id, nombre: mm.nombre }))
          // si tu interfaz Modelo admite comentario, podés pasarlo también
        } as Modelo);

        if (ok) {
          this.successMsg.set('Modelo actualizado correctamente ✅');
        } else {
          this.errorMsg.set('No se pudo actualizar el modelo ❌');
        }

      } else {
        // crear (sin await/Observable)
        this.stock.createModelo({
          nombre: payload.nombre,
          modulos: payload.modules.map(mm => ({ id: mm.id, nombre: mm.nombre }))
          // comentario si tu interfaz lo contempla
        } as Modelo);

        this.successMsg.set('Modelo guardado correctamente ✅');

        // reset solo en alta
        this.form.reset({ tipoOperacion: 'ingreso', comentario: '' });
        this.modulesFA.clear();
        this.submitted.set(false);
      }

      setTimeout(() => this.successMsg.set(null), 2500);
    } catch (e) {
      console.error(e);
      this.errorMsg.set('Error al guardar el modelo');
      setTimeout(() => this.errorMsg.set(null), 3500);
    } finally {
      this.saving.set(false);
    }
  }
}
