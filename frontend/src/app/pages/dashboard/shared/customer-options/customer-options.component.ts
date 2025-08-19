import { Component } from '@angular/core';

import { RouteService } from "@/services/route-service";
import { AudioService } from "@/services/audio-service";

@Component({
  selector: 'dashboard-customer-options',
  templateUrl: './customer-options.component.html',
  styleUrls: ['./customer-options.component.scss']
})
export class CustomerOptionsComponent {
  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async newOrder() : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadNewOrder();
  }

  public async userOrders() : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadUserOrders();
  }
}
