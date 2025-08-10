import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AudioService } from "./services/audio-service";
import { RouteService } from "./services/route-service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    AudioService,
    RouteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
