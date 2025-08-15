import { Component } from '@angular/core';

import { RouteService } from "../../../../services/route-service";
import { AudioService } from "../../../../services/audio-service";

@Component({
  selector: 'dashboard-chef-options',
  templateUrl: './chef-options.component.html',
  styleUrls: ['./chef-options.component.scss']
})
export class ChefOptionsComponent {
  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async incompleteSuborders() : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadSuborders();
  }
}
