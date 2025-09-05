import { Routes } from '@angular/router';

import { StockHomeComponent } from './modules/stock/pages/stock-home/stock-home';
import { NewModelComponent } from './modules/stock/new-model/new-model';
import { ModelosList } from './modules/stock/modelos-list/modelos-list';
import { NewInsumosComponent } from './modules/stock/components/new-insumos/new-insumos';
import { GestionModelComponent } from './modules/stock/gestion-model/gestion-model';
import { BlankComponent } from './shared/blank.component';

export const routes: Routes = [
  { path: 'movimientos', component: StockHomeComponent, title: 'Inicio' },

  { path: 'stock', component: ModelosList, title: 'Modelos' },
  { path: '', component: BlankComponent },
  { path: 'modelos/nuevo', component: NewModelComponent, title: 'Nuevo modelo' },
  { path: 'modelos/:id', component: NewModelComponent, title: 'Editar modelo' },
  { path: 'modelos/gestion/:id', component: GestionModelComponent, title: 'Gestion modelo' },
  { path: 'insumos/nuevo', component: NewInsumosComponent },
  { path: 'insumos/gestion/:id', component: NewInsumosComponent, title: 'Gestion insumo' },
  { path: '', redirectTo: 'modelos', pathMatch: 'full' },
  { path: '**', redirectTo: 'stock' }, // 404 -> lista de modelos
];
