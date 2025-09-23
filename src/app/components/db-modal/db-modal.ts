import { Component, signal } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { inject } from '@angular/core';
import { DbService } from '../../core/services/db';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-db-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './db-modal.html',
  styleUrls: ['./db-modal.scss'],
})
export class DbModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  private db: DbService;
  constructor() {
    this.db = inject(DbService);
  }
  
  // showDbModal se maneja desde el componente principal
  mode = signal<'export' | 'import'>('export');
  errorMsg = signal('');
  loading = signal(false);
  file: File | null = null;

  ngOnInit() {
  }
  close() {
  this.errorMsg.set('');
  this.file = null;
  this.closeModal.emit();
  }

  setMode(m: 'export' | 'import') { this.mode.set(m); this.errorMsg.set(''); }

  onFileChange(event: any) {
    const files = event.target.files;
    this.file = files && files.length ? files[0] : null;
  }

  async exportDb() {
    this.loading.set(true);
    try {
      await this.db.exportDb();
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Error al exportar');
    } finally {
      this.loading.set(false);
    }
  }

  async importDb() {
    if (!this.file) {
      this.errorMsg.set('Seleccioná un archivo .db para importar');
      return;
    }
    this.loading.set(true);
    try {
      await this.db.importDb(this.file);
      this.close();
      alert('Base de datos importada correctamente');
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Error al importar');
    } finally {
      this.loading.set(false);
    }
  }
}
