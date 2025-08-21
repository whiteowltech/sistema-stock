import { Routes } from '@angular/router';

import { StockHomeComponent } from './modules/stock/pages/stock-home/stock-home';
import { NewModelComponent } from './modules/stock/new-model/new-model';
import { ModelosList } from './modules/stock/modelos-list/modelos-list';
import { NewInsumosComponent } from './modules/stock/components/new-insumos/new-insumos';
// import { MovimientosListComponent } from './modules/stock/movimientos/movimientos-list.component'; // si lo tenés

export const routes: Routes = [
  { path: 'movimientos', component: StockHomeComponent, title: 'Inicio' },

  { path: 'modelos', component: ModelosList, title: 'Modelos' },
  { path: 'modelos/nuevo', component: NewModelComponent, title: 'Nuevo modelo' },
  { path: 'modelos/:id', component: NewModelComponent, title: 'Editar modelo' },
  { path: 'insumos/nuevo', component: NewInsumosComponent },
  { path: '', redirectTo: 'modelos', pathMatch: 'full' },
  { path: '**', redirectTo: 'modelos' }, // 404 -> lista de modelos
];
