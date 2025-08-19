import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "@/utils/page";

import { AuthService } from "@/services/auth-service";
import { RouteService } from "@/services/route-service";
import { AudioService } from "@/services/audio-service";
import { ModalService } from "@/services/modal-service";

import { SharedAuthModuleModule } from "./shared/shared-auth-module.module";

@Component({
  selector: 'app-login',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SharedAuthModuleModule
  ]
})
export class AuthComponent extends Page implements AfterViewInit {
  constructor(auth: AuthService, routes: RouteService, audio: AudioService, modal: ModalService) {
    super(auth, routes, audio, modal);
  }

  public async ngAfterViewInit() : Promise<void> {
    if (this.auth.loggedIn())
      return this.routes.loadDashboard();
  }
}
