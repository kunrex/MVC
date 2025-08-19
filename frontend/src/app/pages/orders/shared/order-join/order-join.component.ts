import { Component } from '@angular/core';

import { RouteService } from "@/services/route-service";
import { AudioService } from "@/services/audio-service";

@Component({
  selector: 'orders-order-join',
  templateUrl: './order-join.component.html',
  styleUrls: ['./order-join.component.scss']
})
export class OrderJoinComponent {
  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async fetchOrder(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);

    const author = formData.get('author') as string;
    const id = parseInt(formData.get('id') as string);

    await this.routes.loadOrder(id, author);
  }
}
