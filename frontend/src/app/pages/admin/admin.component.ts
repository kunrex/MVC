import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";
import {between} from "../../utils/functions";

class MenuItem {
  public readonly tags: string[] = [];
  constructor(public readonly id: number, public readonly name: string) { }
}

class UpdateTagsOptions {
  public idValue: string = '';
  public disableEditing: boolean = true;
}

class CreateTagOptions {
  public error: string = '';
  public value: string = '';
}

class CreateFoodOptions {
  public name: string = '';
  public description: string = '';

  public price: number = 0;
  public vegetarian: boolean = true;

  public timeHours: number = 0;
  public timeMinutes: number = 0;
  public timeSeconds: number = 0;

  public imageURL: string = '';

  public showImage: boolean = false;
  public imageLoaded: boolean = false;

  public error: string = '';
}

class UserPermissionsOptions {
  public id: number = 0;
  public email: string = '';

  public isChef: boolean = false;
  public isAdmin: boolean = false;
  public permissionsLoaded: boolean = false;

  public error: string = '';
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class AdminComponent extends Page implements AfterViewInit {
  public readonly tags: string[] = [];
  private readonly selectedTags: string[] = [];

  public readonly menu: MenuItem[] = [];

  public readonly createTagOptions: CreateTagOptions = new CreateTagOptions();
  public readonly updateTagOptions: UpdateTagsOptions = new UpdateTagsOptions();

  public readonly createFoodOptions: CreateFoodOptions = new CreateFoodOptions();

  public readonly userPermissionsOptions: UserPermissionsOptions = new UserPermissionsOptions();

  constructor(routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.loadTagsMenu();
  }

  public tagTracking(i: number, tag: string) : string {
    return tag;
  }

  public itemTracking(i: number, item: MenuItem) : number {
    return item.id;
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await fetch(`${serverAddress}/menu`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    const jsonMenu = JSON.parse(json.menu);
    const jsonMenuLength = jsonMenu.length;
    for (let i = 0, l = jsonMenuLength; i < l; i++) {
      const current = jsonMenu[i];

      const item = new MenuItem(
        current.id,
        current.name
      );

      const tags = current.tags.split(',')
      const tagsLength = tags.length;
      for(let j = 0; j < tagsLength; j++)
        item.tags.push(tags[j]);

      this.menu.push(item);
    }

    const jsonTags = JSON.parse(json.tags);
    const jsonTagsLength = jsonTags.length;
    for (let i = 0, l = jsonTagsLength; i < l; i++)
      this.tags.push(jsonTags[i]);
  }

  public checkTagSelected(tag: string) : boolean {
    return this.selectedTags.indexOf(tag) > -1;
  }

  public selectItemUpdateTags(e: Event) {
    const parsed = parseInt(this.updateTagOptions.idValue)

    this.selectedTags.slice(0, this.selectedTags.length);
    const menuCount = this.menu.length;
    for(let i = 0; i < menuCount; i++) {
      const current = this.menu[i];

      if(current.id == parsed) {
        const tagsCount = current.tags.length;
        for(let j = 0; j < tagsCount; j++)
          this.selectedTags.push(current.tags[j]);

        break;
      }
    }

    this.updateTagOptions.disableEditing = false;
  }

  public toggleTag(tag: string) : void {
    const index = this.selectedTags.indexOf(tag);

    if(index < 0)
      this.selectedTags.push(tag);
    else
      this.selectedTags.splice(index, 1);

    this.playClickSFX().then();
  }

  public async confirmEditTagChanges() : Promise<void> {
    const response = await fetch(`${serverAddress}/admin/food/updateTags`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        foodId: parseInt(this.updateTagOptions.idValue),
        tags: this.selectedTags,
      })
    });

    if (response.status == 200) {
      this.updateTagOptions.idValue = '';
      this.updateTagOptions.disableEditing = true;

      this.selectedTags.splice(0, this.selectedTags.length);

      this.modalService.showModal('Update successful', 'Item updated successfully');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async createTag() : Promise<void> {
    const value = this.createTagOptions.value;
    if (!between(value.length, 1, 50)) {
      this.createTagOptions.error = 'Enter a valid tag (max: 50 characters)';
      return;
    }

    if(this.tags.indexOf(value) > -1) {
      this.createTagOptions.error = '*Tag already exists';
      return;
    }

    const response = await fetch(`${serverAddress}/admin/tags/add/${value}`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.status == 200) {
      this.createTagOptions.value = this.createTagOptions.error = '';

      this.tags.push(value);
      this.modalService.showModal('Creation Successful', 'Tag creation as successful');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public setVegetarian() : void {
    this.createFoodOptions.vegetarian = true;
    this.playClickSFX().then();
  }

  public setNonVegetarian() : void {
    this.createFoodOptions.vegetarian = false;
    this.playClickSFX().then();
  }

  public fetchImage() : void {
    this.createFoodOptions.showImage = true;
    this.createFoodOptions.imageLoaded = false;
    this.playClickSFX().then();
  }

  public async addFoodConfirm() {
    const name = this.createFoodOptions.name;
    const description = this.createFoodOptions.description;

    const price = this.createFoodOptions.price;

    const hours = this.createFoodOptions.timeHours;
    const minutes = this.createFoodOptions.timeMinutes;
    const seconds = this.createFoodOptions.timeSeconds;

    if(!between(name.length, 1, 100) || !between(description.length, 1, 300)) {
      this.createFoodOptions.error = 'Enter a valid name (max: 100 characters) and description (max: 300 characters)';
      return;
    }

    if(price <= 0) {
      this.createFoodOptions.error = 'Enter a valid price';
      return;
    }

    if(!between(hours, 0, 23) || !between(minutes, 0, 59) || !between(seconds, 0, 59) || hours + minutes + seconds == 0) {
      this.createFoodOptions.error = 'Enter a valid time';
      return;
    }

    if(!this.createFoodOptions.imageLoaded) {
      this.createFoodOptions.error = "No image loaded";
      return;
    }

    const response = await fetch(`${serverAddress}/admin/food/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: name,
        price: price,
        description: description,

        vegetarian: this.createFoodOptions.vegetarian,
        cookTime: `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`,

        imageURL: this.createFoodOptions.imageURL
      })
    });

    if(response.status == 200) {
      const insertId = parseInt(await response.text());
      this.menu.push(new MenuItem(insertId, this.createFoodOptions.name));

      this.createFoodOptions.vegetarian = true;
      this.createFoodOptions.showImage = this.createFoodOptions.imageLoaded = false;
      this.createFoodOptions.name = this.createFoodOptions.description = this.createFoodOptions.imageURL = '';
      this.createFoodOptions.price = this.createFoodOptions.timeHours = this.createFoodOptions.timeMinutes = this.createFoodOptions.timeSeconds = 0;

      this.modalService.showModal('Creation Successful', 'Item creation was successful');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async loadUserPermissions() : Promise<void> {
    const response = await fetch(`${serverAddress}/admin/user/authorisation/get/${this.userPermissionsOptions.email}`, {
      method: 'GET',
      credentials: 'include'
    })

    const json = await response.json();

    if(response.status == 200) {
      this.userPermissionsOptions.permissionsLoaded = true;

      this.userPermissionsOptions.id = json.id;
      const auth = json.authorisation;

      this.userPermissionsOptions.isChef = (auth & 2) == 2;
      this.userPermissionsOptions.isAdmin = (auth & 4) == 4;

      return;
    }

    this.userPermissionsOptions.error = json.error;
  }

  public toggleChef() : void {
    this.userPermissionsOptions.isChef = !this.userPermissionsOptions.isChef;
  }

  public setAdmin() : void {
    this.userPermissionsOptions.isAdmin = true;
  }

  public async confirmUserPermissions() : Promise<void> {
    let auth = 1 | (this.userPermissionsOptions.isChef ? 2 : 1) | (this.userPermissionsOptions.isAdmin ? 4 : 1);

    const response = await fetch(`${serverAddress}/admin/user/authorisation/set/${this.userPermissionsOptions.id}/${auth}`, {
      method: 'PATCH',
      credentials: 'include'
    })

    if(response.status == 200) {
      this.clearUserPermissions();

      this.modalService.showModal('Update Successful', 'User permissions updated successfully');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public clearUserPermissions() : void {
    this.userPermissionsOptions.id = 0;
    this.userPermissionsOptions.email = '';

    this.userPermissionsOptions.isChef = this.userPermissionsOptions.isAdmin = this.userPermissionsOptions.permissionsLoaded = false;

    this.userPermissionsOptions.error = '';
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
