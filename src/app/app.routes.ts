import { Routes } from '@angular/router';
// import { StockListComponent } from './modules/stock/components/stock-list/stock-list';
import { StockHomeComponent } from './modules/stock/pages/stock-home/stock-home';
import { NewModelComponent } from './modules/stock/new-model/new-model';
import { ModelosList } from './modules/stock/modelos-list/modelos-list';

export const routes: Routes = [
  { path: 'stock', component: StockHomeComponent },
  { path: 'modelos', component: ModelosList },
  { path: 'modelos/nuevo', component: NewModelComponent },
  { path: 'modelos/:id', component: NewModelComponent },   // 👈 modo edición
  { path: '', redirectTo: 'modelos', pathMatch: 'full' },
];
