import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MenuComponent } from './menu/menu.component';
import { BillingComponent } from './billing/billing.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

@NgModule({
  declarations: [
    MenuComponent,
    BillingComponent,
    OrderDetailsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    MenuComponent,
    BillingComponent,
    OrderDetailsComponent
  ]
})
export class SharedOrderModuleModule { }
