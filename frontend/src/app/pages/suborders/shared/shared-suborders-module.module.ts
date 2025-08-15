import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SubordersDisplayComponent } from './suborders-display/suborders-display.component';

@NgModule({
  declarations: [
    SubordersDisplayComponent
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    SubordersDisplayComponent
  ],
})
export class SharedSubordersModuleModule { }
