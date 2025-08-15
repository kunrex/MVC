import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ChefOptionsComponent } from './chef-options/chef-options.component';
import { AdminOptionsComponent } from './admin-options/admin-options.component';
import { CustomerOptionsComponent } from './customer-options/customer-options.component';

@NgModule({
  declarations: [
    ChefOptionsComponent,
    AdminOptionsComponent,
    CustomerOptionsComponent
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    ChefOptionsComponent,
    AdminOptionsComponent,
    CustomerOptionsComponent
  ],
})
export class DashboardSharedModuleModule { }
