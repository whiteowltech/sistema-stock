import { Routes } from '@angular/router';

import { StockHomeComponent } from './modules/stock/pages/stock-home/stock-home';
import { NewModelComponent } from './modules/stock/new-model/new-model';
import { ModelosList } from './modules/stock/modelos-list/modelos-list';
import { NewInsumosComponent } from './modules/stock/components/new-insumos/new-insumos';
import { BlankComponent } from './shared/blank.component';
import { UpdateModelComponent } from './modules/stock/update-model/update-model';
import { InsumoList } from './modules/stock/insumo-list/insumo-list';

export const routes: Routes = [
  { path: 'movimientos', component: StockHomeComponent, title: 'Movimientos' },

  { path: 'modelos', component: ModelosList, title: 'Inicio' },
  { path: 'insumos', component: InsumoList, title: 'Insumos' },
  { path: '', component: BlankComponent },
  { path: 'modelos/nuevo', component: NewModelComponent, title: 'Nuevo modelo' },
  { path: 'modelos/gestion/:id', component: UpdateModelComponent, title: 'Gestion modelo' },
  { path: 'insumos/nuevo', component: NewInsumosComponent, title: 'Nuevo insumo' },
  { path: 'insumos/gestion/:id', component: NewInsumosComponent, title: 'Gestion insumo' },
  { path: '', redirectTo: 'modelos', pathMatch: 'full' },
  { path: '**', redirectTo: 'stock' }, // 404 -> lista de modelos
];
