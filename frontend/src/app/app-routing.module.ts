import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from "@/pages/auth/auth.component";
import { AdminComponent } from "@/pages/admin/admin.component";
import { OrderComponent } from "@/pages/order/order.component";
import { OrdersComponent } from "@/pages/orders/orders.component";
import { SubordersComponent } from "@/pages/suborders/suborders.component";
import { DashboardComponent } from "@/pages/dashboard/dashboard.component";

import { AppRoute } from "@/utils/enums";

const routes: Routes = [
  { path: '', redirectTo: AppRoute.Auth, pathMatch: "full" },

  { path: AppRoute.Auth, component: AuthComponent },
  { path: AppRoute.Admin, component: AdminComponent },
  {
    path: AppRoute.Order,
    children: [
      { path: '', component: OrderComponent },
      { path: ':id/:authorName', component: OrderComponent }
    ]
  },
  {
    path: AppRoute.Orders,
    children: [
      { path: 'all', component: OrdersComponent },
      { path: 'user', component: OrdersComponent }
    ]
  },
  { path: AppRoute.Suborders, component: SubordersComponent },
  { path: AppRoute.Dashboard, component: DashboardComponent },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
