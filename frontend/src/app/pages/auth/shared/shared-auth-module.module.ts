import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SignupComponent } from './signup/signup.component';
import {LoginComponent} from "./login/login.component";

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoginComponent,
    SignupComponent
  ],
})
export class SharedAuthModuleModule { }
