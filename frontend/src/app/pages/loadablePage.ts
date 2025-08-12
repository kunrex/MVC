import { Component } from '@angular/core';

import { RouteService } from "../services/route-service";
import { AudioService } from "../services/audio-service";

import { Page } from "./page";

@Component({
  template: ''
})
export abstract class LoadablePage extends Page {
  protected loaded = false;
  public hasLoaded() : boolean { return this.loaded; }

  protected constructor(routes: RouteService, audioService: AudioService) {
    super(routes, audioService);
  }
}
