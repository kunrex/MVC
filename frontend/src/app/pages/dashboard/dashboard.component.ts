import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public isChef: boolean = false;
  public isAdmin: boolean = false;

  constructor(routes: RouteService, audioService: AudioService, modalService: ModalService,) {
    super(routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    if (!this.routes.isLoggedIn())
      return this.routes.loadLogin();

    const response = await fetch(`${serverAddress}/user/permissions`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if (response.status == 200) {
      this.isChef = json.chef
      this.isAdmin = json.admin

      this.loaded = true
    }

    this.modalService.showError(json.error);
  }

  public async signOut() : Promise<void> {
    await this.playClickSFX();

    const response = await fetch(`${serverAddress}/user/signOut`, {
      method: 'POST',
      credentials: 'include',
    })

    if(response.status == 200)
      return this.routes.registerSignOut();

    this.modalService.showError((await response.json()).error);
  }

  public newOrder() : Promise<void> {
    return this.routes.loadNewOrder()
  }

  public userOrders() : Promise<void> {
    return this.routes.loadUserOrders()
  }

  public incompleteSuborders() : Promise<void> {
    return this.routes.loadSuborders()
  }

  public allOrders() : Promise<void> {
    return this.routes.loadAllOrders()
  }

  public adminOptions() : Promise<void> {
    return this.routes.loadAdmin()
  }
}
