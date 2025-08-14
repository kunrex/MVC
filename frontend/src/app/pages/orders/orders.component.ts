import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

class Order {
  constructor(public readonly id: number, public readonly createdOn: string, public readonly authorName: string, public readonly completed: boolean) { }
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class OrdersComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;
  public readonly userOrders: boolean;

  public orders: Order[] = []

  constructor(routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(routes, audioService, modalService);
    this.userOrders = this.routes.matchRoute('/orders/user');
  }

  public async ngAfterViewInit() : Promise<void> {
    if(!this.routes.isLoggedIn())
      return this.routes.loadLogin();

    const response = await fetch(this.userOrders ? `${serverAddress}/orders/user` : `${serverAddress}/orders/all`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if(response.status == 200) {
      const jsonLength = json.length;
      for(let i = 0; i < jsonLength; i++) {
        const current = json[i]

        this.orders.push(new Order(
          current.id,
          current.createdOn,
          current.authorName,
          current.completed,
        ));
      }

      this.loaded = true;
      return;
    }

    this.modalService.showError(json.error);
  }

  public orderTracking(i: number, order: Order) : number {
    return order.id;
  }

  public async loadOrder(orderId: number, authorName: string) : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadOrder(orderId, authorName);
  }

  public async fetchOrder(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);

    const author = formData.get('author') as string;
    const id = parseInt(formData.get('id') as string);

    await this.routes.loadOrder(id, author);
  }

  public async loadDashboard() : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadDashboard();
  }
}
