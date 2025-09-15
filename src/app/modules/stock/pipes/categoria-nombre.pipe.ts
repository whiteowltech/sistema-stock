import { Pipe, PipeTransform } from '@angular/core';

const MAP: Record<string, string> = {
  con_borde: 'Módulo con marco',
  sin_borde: 'Módulo sin marco',
  plaqueta_carga: 'Plaqueta carga',
  tapa_trasera: 'Tapa trasera',
};

@Pipe({ name: 'categoriaNombre', standalone: true })
export class CategoriaNombrePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Cantidad';
    return MAP[value] || value.replace(/_/g, ' ');
  }
}
