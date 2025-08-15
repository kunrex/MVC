import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AddFoodComponent } from './add-food/add-food.component';
import { EditTagsComponent } from './edit-tags/edit-tags.component';
import { CreateTagComponent } from './create-tag/create-tag.component';
import { CurrentMenuComponent } from './current-menu/current-menu.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';

@NgModule({
  declarations: [
    AddFoodComponent,
    EditTagsComponent,
    CreateTagComponent,
    CurrentMenuComponent,
    UserPermissionsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
  ],
  exports: [
    AddFoodComponent,
    EditTagsComponent,
    CreateTagComponent,
    CurrentMenuComponent,
    UserPermissionsComponent
  ]
})
export class AdminSharedModuleModule { }
