import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

import { MenuItem } from "./types/menu-item";
import { AdminSharedModuleModule } from "./shared/admin-shared-module.module";
import {AuthService} from "../../services/auth-service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AdminSharedModuleModule
  ]
})
export class AdminComponent extends Page implements AfterViewInit {
  public readonly tags: string[] = [];
  public readonly menu: MenuItem[] = [];

  constructor(auth: AuthService, routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(auth, routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    if(!this.auth.isLoggedIn())
      return this.routes.loadLogin();

    if(!this.auth.isAdmin()) {
      this.modalService.showError('you are not authorised to view this page')
      return;
    }

    await this.loadTagsMenu();
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await this.auth.fetchAuthorization('GET', 'menu', null)
    const json = await response.json();

    const jsonMenu = JSON.parse(json.menu);
    const jsonMenuLength = jsonMenu.length;
    for (let i = 0, l = jsonMenuLength; i < l; i++) {
      const current = jsonMenu[i];

      const item = new MenuItem(
        current.id,
        current.name,
        current.price,
        current.description,
        current.cookTime,
        current.imageURL,
        current.vegetarian
      );

      if(current.tags != '') {
        const tags = current.tags.split(',')
        const tagsLength = tags.length;

        for(let j = 0; j < tagsLength; j++)
          item.tags.push(tags[j]);
      }

      this.menu.push(item);
    }

    const jsonTags = JSON.parse(json.tags);
    const jsonTagsLength = jsonTags.length;
    for (let i = 0, l = jsonTagsLength; i < l; i++)
      this.tags.push(jsonTags[i]);
  }

  public async loadDashboard() : Promise<void> {
    await this.playClickSFX();
    return this.routes.loadDashboard();
  }
}
