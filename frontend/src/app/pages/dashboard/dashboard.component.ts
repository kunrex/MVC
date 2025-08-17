import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Page } from "../../utils/page";

import { AuthService } from "../../services/auth-service";
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
  public isChef: boolean = false;
  public isAdmin: boolean = false;

  @ViewChild('chef') private readonly chefReference!: ElementRef;
  @ViewChild('admin') private readonly adminReference!: ElementRef;
  @ViewChild('customer') private readonly customerReference!: ElementRef;

  constructor(auth: AuthService, routes: RouteService, audioService: AudioService, modalService: ModalService,) {
    super(auth, routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    if (!this.auth.isLoggedIn())
      return this.routes.loadLogin();

    this.isChef = this.auth.isChef()
    this.isAdmin =  this.auth.isAdmin()
  }

  public signOut() : Promise<void> {
    this.auth.registerSignOut();
    return this.routes.loadLogin();
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
