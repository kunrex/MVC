import { Component } from '@angular/core';

import { RouteService } from "../../../../services/route-service";
import { AudioService } from "../../../../services/audio-service";

@Component({
  selector: 'dashboard-admin-options',
  templateUrl: './admin-options.component.html',
  styleUrls: ['./admin-options.component.scss']
})
export class AdminOptionsComponent {
  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async allOrders() : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadAllOrders();
  }

  public async adminOptions() : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadAdmin();
  }
}
