import { Component } from '@angular/core';

import { AuthService } from "../services/auth-service";
import { RouteService } from "../services/route-service";
import { AudioService } from "../services/audio-service";
import { ModalService } from "../services/modal-service";

@Component({
  template: ''
})
export abstract class Page {
  protected constructor(protected readonly auth: AuthService, protected readonly routes: RouteService, protected readonly audioService: AudioService, protected readonly modalService: ModalService) {
    this.audioService.initBackgroundMusic().then();
  }

  public playClickSFX() : Promise<void> {
    return this.audioService.playClickSFX()
  }
}
