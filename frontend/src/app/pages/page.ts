import { Component } from '@angular/core';

import { RouteService } from "../services/route-service";
import { AudioService } from "../services/audio-service";

@Component({
  template: ''
})
export abstract class Page {
  protected constructor(protected readonly routes: RouteService, protected readonly audioService: AudioService) { }

  public playClickSFX() : Promise<void> {
    return this.audioService.playCLickSFX()
  }
}
