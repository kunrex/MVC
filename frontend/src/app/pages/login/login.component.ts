
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

import { SharedLoginModuleModule } from "./shared/shared-login-module.module";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SharedLoginModuleModule
  ]
})
export class LoginComponent extends Page implements AfterViewInit {
  constructor(routes: RouteService, audio: AudioService, modal: ModalService) {
    super(routes, audio, modal);
  }

  public async ngAfterViewInit() : Promise<void> {
    if (this.routes.isLoggedIn())
      return this.routes.loadDashboard();
  }
}
