import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from "./pages/login/login.component";
import { AdminComponent } from "./pages/admin/admin.component";
import { OrderComponent } from "./pages/order/order.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { SubordersComponent } from "./pages/suborders/suborders.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: "full" },

  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  {
    path: 'order',
    children: [
      { path: '', component: OrderComponent },
      { path: ':id/:authorName', component: OrderComponent }
    ]
  },
  {
    path: 'orders',
    children: [
      { path: 'all', component: OrdersComponent },
      { path: 'user', component: OrdersComponent }
    ]
  },
  { path: 'suborders', component: SubordersComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
