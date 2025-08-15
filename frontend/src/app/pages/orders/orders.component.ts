import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

import { Order } from "./types/order";
import { SharedOrdersModuleModule } from "./shared/shared-orders-module.module";


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SharedOrdersModuleModule
  ]
})
export class OrdersComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public readonly userOrders: boolean;

  private readonly allOrders: Order[] = [];
  public readonly displayedOrders: Order[] = [];

  public showPaid: boolean = true;
  public showOrdered: boolean = true;
  public showCompleted: boolean = true;

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
        const current = json[i];
        const order = new Order(
          current.id,
          current.createdOn,
          current.authorName,
          current.completed,
          current.paid
        );

        this.allOrders.push(order);
        this.displayedOrders.push(order);
      }

      this.loaded = true;
      return;
    }

    this.modalService.showError(json.error);
  }

  public togglePaid() : void {
    this.showPaid = !this.showPaid;
    this.renderOrders();
  }

  public toggleOrdered() : void {
    this.showOrdered = !this.showOrdered;
    this.renderOrders();
  }

  public toggleCompleted() : void {
    this.showCompleted = !this.showCompleted;
    this.renderOrders();
  }

  private renderOrders() : void {
    this.displayedOrders.splice(0, this.displayedOrders.length);

    const count = this.allOrders.length;
    for (let i = 0; i < count; i++)
    {
      const current = this.allOrders[i];

      if((this.showOrdered || this.showCompleted) && current.paid == this.showPaid)
        this.displayedOrders.push(current);
    }
  }


  public async loadDashboard() : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadDashboard();
  }
}
