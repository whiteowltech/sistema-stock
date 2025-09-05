import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DbService {
  private readonly API = 'http://localhost:4000';
  constructor(private http: HttpClient) {}

  // Exportar base de datos (descargar archivo) usando HttpClient y ruta correcta
  exportDb(): Promise<void> {
    return this.http.get(`${this.API}/db/export`, { responseType: 'blob', observe: 'response' })
      .toPromise()
      .then(response => {
        const blob = response!.body as Blob;
        // Obtener el nombre del archivo del header Content-Disposition
        const disposition = response!.headers.get('content-disposition');
        let filename = 'stock-db-backup.zip';
        if (disposition) {
          const match = disposition.match(/filename="?([^";]+)"?/);
          if (match) filename = match[1];
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  }

  // Importar base de datos (subir archivo) usando HttpClient y ruta correcta
  importDb(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('db', file);
    return this.http.post<{ ok: boolean; error?: string }>(`${this.API}/db/import`, formData)
      .toPromise()
      .then(data => {
        if (!data?.ok) throw new Error(data?.error || 'Error al importar');
      });
  }
}
