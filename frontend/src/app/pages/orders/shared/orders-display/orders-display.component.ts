import { Component, Input } from '@angular/core';

import { AudioService } from "../../../../services/audio-service";
import { RouteService } from "../../../../services/route-service";

import { Order } from "../../types/order";
import {months} from "../../../../utils/constants";

@Component({
  selector: 'orders-orders-display',
  templateUrl: './orders-display.component.html',
  styleUrls: ['./orders-display.component.scss']
})
export class OrdersDisplayComponent {
  @Input() public orders: Order[] = [];

  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public orderTracking(i: number, order: Order) : number {
    return order.id;
  }

  public dateTimePrettyPrint(dateString: string): string {
    const data = dateString.split(' ');

    const dates = data[0].split('-').map((x: string) => parseInt(x));
    const date = `${months[dates[1] - 1]} ${dates[2]}, ${dates[0]}`;

    const times = data[1].split(':').map((x: string) => parseInt(x));
    const time = `${times[0] > 12 ? times[0] - 12 : times[0]}:${times[1]} ${(times[0] > 12 ? 'pm' : 'am')}`;

    return `${time} on ${date}`;
  }

  public async loadOrder(orderId: number, authorName: string) : Promise<void> {
    await this.audioService.playClickSFX();
    return this.routes.loadOrder(orderId, authorName);
  }
}
