import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "@/utils/page";

import { AuthService } from "@/services/auth-service";
import { RouteService } from "@/services/route-service";
import { AudioService } from "@/services/audio-service";
import { ModalService } from "@/services/modal-service";

import { Suborder } from "./types/suborder";
import { SharedSubordersModuleModule } from "./shared/shared-suborders-module.module";

@Component({
  selector: 'app-suborders',
  templateUrl: './suborders.component.html',
  styleUrls: ['./suborders.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SharedSubordersModuleModule
  ]
})
export class SubordersComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public readonly orderIds: number[] = [];
  public readonly displayedOrderIds: number[] = [];

  public readonly suborders: Suborder[] = [];
  public readonly displayedSuborders: Suborder[] = [];

  constructor(auth: AuthService, routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(auth, routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    if(!this.auth.loggedIn())
      return this.routes.loadLogin();

    if(!this.auth.isChef()) {
      this.modalService.showError('you are not authorised to view this page')
      return;
    }

    const response = await this.auth.fetchAuthorization('GET', 'suborders/incomplete', null);

    const json = await response.json();

    if (response.status == 200) {
      const jsonLength = json.length;
      for(let i = 0; i < jsonLength; i++) {
        const current = json[i]

        const suborder = new Suborder(
          current.id,
          current.orderId,
          current.foodName,
          current.quantity,
          current.instructions,
          current.status
        )

        this.suborders.push(suborder);
        this.displayedSuborders.push(suborder);

        if(this.orderIds.indexOf(current.orderId) < 0) {
          this.orderIds.push(current.orderId);
          this.displayedOrderIds.push(current.orderId);
        }
      }

      this.loaded = true;
      return;
    }

    this.modalService.showError(json.error)
  }

  public orderIdTracking(i: number, orderId: number) : number {
    return orderId;
  }

  public toggleOrder(orderId: number) : void {
    const index = this.displayedOrderIds.indexOf(orderId);
    if(index > -1)
      this.displayedOrderIds.splice(index, 1);
    else
      this.displayedOrderIds.push(orderId);

    this.displayedSuborders.splice(0, this.displayedSuborders.length);
    for(let i = 0; i < this.suborders.length; i++) {
      const current = this.suborders[i];

      if(this.displayedOrderIds.indexOf(current.orderId) > -1)
        this.displayedSuborders.push(current);
    }
  }

  public async confirmChanges(e: Event) : Promise<void> {
    const changes: Suborder[] = [];

    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if(suborder.code < 1)
        changes.push(suborder);
    }

    if(changes.length == 0)
      return this.routes.loadDashboard();

    const response = await this.auth.fetchAuthorization('PATCH', 'suborders/incomplete/update', changes)
    await this.playClickSFX();

    if (response.status != 200)
      this.modalService.showError((await response.json()).error)
  }

  public async loadDashboard() : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadDashboard();
  }
}
