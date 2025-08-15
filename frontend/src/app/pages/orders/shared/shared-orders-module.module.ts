import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { OrderJoinComponent } from './order-join/order-join.component';
import { OrdersDisplayComponent } from './orders-display/orders-display.component';

@NgModule({
  declarations: [
    OrderJoinComponent,
    OrdersDisplayComponent,
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    OrderJoinComponent,
    OrdersDisplayComponent,
  ],
})
export class SharedOrdersModuleModule { }
