import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";

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

  public orders: Order[] = []
  public allowJoin: boolean = true;

  constructor(routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(routes, audioService, modalService);
  }

  public async ngAfterViewInit() : Promise<void> {
    if(!this.routes.isLoggedIn()) {
      await this.routes.loadLogin();
      return;
    }

    this.allowJoin = this.routes.matchRoute('orders/all');
    const response = await fetch(this.allowJoin ? `${serverAddress}/orders/all` : `${serverAddress}/orders/user`, {
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

  public loadOrder(orderId: number, authorName: string) : Promise<void> {
    return this.routes.loadOrder(orderId, authorName, this.allowJoin);
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
