import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

import { DashboardSharedModuleModule } from "./shared/dashboard-shared-module.module";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DashboardSharedModuleModule
  ]
})
export class DashboardComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public isChef: boolean = false;
  public isAdmin: boolean = false;

  @ViewChild('chef') private readonly chefReference!: ElementRef;
  @ViewChild('admin') private readonly adminReference!: ElementRef;
  @ViewChild('customer') private readonly customerReference!: ElementRef;

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

      return;
    }

    this.modalService.showError(json.error);
  }

  public async signOut() : Promise<void> {
    const response = await fetch(`${serverAddress}/user/signout`, {
      method: 'POST',
      credentials: 'include',
    });

    if(response.status == 200)
      return this.routes.registerSignOut();

    this.modalService.showError((await response.json()).error);
  }



  public async incompleteSuborders() : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadSuborders();
  }



  public async navigateCustomer() : Promise<void> {
    await this.playClickSFX();
    this.customerReference.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }

  public async navigateChef() : Promise<void> {
    await this.playClickSFX();
    this.chefReference.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }

  public async navigateAdmin() : Promise<void> {
    await this.playClickSFX();
    this.adminReference.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }
}
