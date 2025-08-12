import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Modal } from "bootstrap";

import { serverAddress } from "../../utils";
import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";

import { LoadablePage } from "../loadablePage";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends LoadablePage implements AfterViewInit {
  private chef = false;
  private admin = false;

  @ViewChild("signOut") private readonly signOut!: ElementRef;

  private errorModal : Modal | undefined;
  @ViewChild("errorText") private readonly errorText!: ElementRef;
  @ViewChild("error") private readonly errorModalReference!: ElementRef;

  constructor(routes: RouteService, audioService: AudioService) {
    super(routes, audioService);
  }

  public isChef() : boolean { return this.chef; }
  public isAdmin() : boolean { return this.admin; }

  ngAfterViewInit(): void {
    if (!this.routes.isLoggedIn())
    {
      await this.routes.loadLogin()
      return
    }

    const modal = this.errorModalReference.nativeElement
    this.errorModal = new Modal(modal, {
      backdrop: 'static',
      keyboard: false,
    })

    this.errorModal.hide()

    const signOutButton = this.signOut.nativeElement as HTMLElement
    signOutButton.onclick = async () => {
      const response = await fetch(`${serverAddress}/user/signOut`, {
        method: 'POST',
        credentials: 'include',
      })

      await this.routes.registerSignOut()
    }

    const response = await fetch(`${serverAddress}/user/permissions`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if (response.status == 200) {
      this.chef = json.chef
      this.admin = json.admin

      this.loaded = true
    }

    const text = this.errorText.nativeElement as HTMLElement
    text.textContent = json.error
  }

  public async login() : Promise<void> {
    await this.routes.loadLogin()
  }

  public async newOrder() : Promise<void> {
    await this.routes.loadNewOrder()
  }

  public async userOrders() : Promise<void> {
    await this.routes.loadUserOrders()
  }

  public async incompleteSuborders() : Promise<void> {
    await this.routes.loadSuborders()
  }

  public async allOrders() : Promise<void> {
    await this.routes.loadAllOrders()
  }

  public async adminOptions() : Promise<void> {
    await this.routes.loadAdmin()
  }
}
