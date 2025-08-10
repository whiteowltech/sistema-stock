import { Routes } from '@angular/router';
import { StockListComponent } from './modules/stock/components/stock-list/stock-list';
import { StockHomeComponent } from './modules/stock/pages/stock-home/stock-home';

export const routes: Routes = [
  { path: 'stock', component: StockHomeComponent },
  { path: '', pathMatch: 'full', redirectTo: 'stock' },
];
