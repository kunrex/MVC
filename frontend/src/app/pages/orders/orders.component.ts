import { Component, AfterViewInit } from '@angular/core';
import { Page } from "../../utils/page";
import {RouteService} from "../../services/route.service";
import {AudioService} from "../../services/audio.service";
import {serverAddress} from "../../utils/constants";

class Order {
  constructor(public readonly id: number, public readonly createdOn: string, public readonly authorName: string, public readonly completed: boolean) { }
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent extends Page implements AfterViewInit {
  public readonly: boolean = true;

  constructor(routes: RouteService, audioService: AudioService) {
    super(routes, audioService);
  }

  public orders: Order[] = []
  public orderTracking(i: number, order: Order) : number {
    return order.id;
  }

  public async ngAfterViewInit() : Promise<void> {
    if(!this.routes.isLoggedIn()) {
      await this.routes.loadLogin();
      return;
    }

    this.readonly = this.routes.matchRoute('orders/all');
  }

  public loadOrder(orderId: number, authorName: string) : Promise<void> {
    return this.routes.loadOrder(orderId, authorName, this.readonly);
  }

  public async fetchOrder(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);

    const author = formData.get('author') as string;
    const id = parseInt(formData.get('id') as string);

    await this.routes.loadOrder(id, author, false);
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }
}
