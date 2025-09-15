import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InsumosService } from '../../../../core/services/insumos';
import e from 'express';

@Component({
  selector: 'app-new-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-insumos.html',
  styleUrls: ['./new-insumos.scss'],
})
export class NewInsumosComponent implements OnInit {
  errorMsg: string = '';
  successMsg: string = '';
  submitted = false;
  isGestionar = true; // Nueva variable para controlar el modo gestionar
  private fb = inject(FormBuilder);
  private insumosSrv = inject(InsumosService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    tipo: ['ingreso'],
    nombre: [''],
    cantidad: [1],
    comentario: [''],
    precio_costo: [''],
    precio_venta: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? idParam : null; // No usar Number si es string/uuid
    console.log('Insumo ID from route:', id);
    if (id) {
      this.insumosSrv.getInsumo(id).subscribe({
        next: (insumo) => {
          this.form.patchValue({
            nombre: insumo.tipoInsumo,
            cantidad: insumo.cantidad,
            precio_costo: insumo.precio_costo,
            precio_venta: insumo.precio_venta
          });
        },
        error: (err) => {
          this.errorMsg = err?.error?.error || 'No se pudo cargar el insumo.';
        }
      });
    }
    else {
      this.isGestionar = false;
    }
  }

  submit() {
    this.submitted = true;
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? idParam : null; // No usar Number si es string/uuid
    if (this.form.valid) {
      const raw = this.form.value;
      if (!raw.nombre || !raw.nombre.trim()) {
        this.errorMsg = 'Debes ingresar el nombre del insumo.';
        return;
      }
      if (!id) {
      const nuevoInsumo = {
        tipoInsumo: raw.nombre,
        cantidad: Number(raw.cantidad),
        precio_costo: String(raw.precio_costo ?? '0'),
        precio_venta: String(raw.precio_venta ?? '0'),
        tipo: (raw.tipo ?? 'ingreso') as 'ingreso' | 'egreso',
        comentario: raw.comentario ?? ''
      };
      
        this.insumosSrv.createInsumo(nuevoInsumo).subscribe({
          next: (insumo) => {
            this.form.reset({ tipo: 'ingreso', nombre: '', cantidad: 1, comentario: '' });
            this.submitted = false;
            this.errorMsg = '';
            this.successMsg = 'Insumo creado correctamente';
          },
          error: (err) => {
            this.errorMsg = err?.error?.error || 'No se pudo crear el insumo.';
          }
        });
      }
      // this.insumosSrv.createInsumo(nuevoInsumo).subscribe({
      //   next: (insumo) => {
      //     this.insumosSrv.addMovimientoInsumo(insumo.id, {
      //       tipo: nuevoInsumo.tipo,
      //       comentario: nuevoInsumo.comentario,
      //       cantidad: Number(raw.cantidad),
      //       fecha: new Date().toISOString()
      //     }).subscribe({
      //       next: () => {
      //         this.form.reset({ tipo: 'ingreso', nombre: '', cantidad: 1, comentario: '' });
      //         this.submitted = false;
      //         this.errorMsg = '';
      //       },
      //       error: (err) => {
      //         this.errorMsg = err?.error?.error || 'No se pudo registrar el movimiento.';
      //       }
      //     });
      //   },
      //   error: (err) => {
      //     this.errorMsg = err?.error?.error || 'No se pudo crear el insumo.';
      //   }
        
      // })}
      else{
        const updatedInsumo = {
          tipoInsumo: raw.nombre,
          cantidad: Number(raw.cantidad),
          precio_costo: String(raw.precio_costo ?? '0'),
          precio_venta: String(raw.precio_venta ?? '0'),
          tipo: (raw.tipo ?? 'ingreso') as 'ingreso' | 'egreso',
          comentario: raw.comentario ?? ''
        };  
        console.log('Updating insumo with ID:', Number(id));
        this.insumosSrv.addMovimientoInsumo(id, updatedInsumo).subscribe({
          next: () => {
            this.form.reset({ tipo: 'ingreso', nombre: '', cantidad: 1, comentario: '' });
            this.submitted = false;
            this.errorMsg = '';
          },
          error: (err) => {
            this.errorMsg = err?.error?.error || 'No se pudo actualizar el insumo.';
          }
        });
      }
    }
  }
  }
  