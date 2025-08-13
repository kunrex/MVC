import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";

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
  public vegetarian: boolean = false;

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

    const jsonMenu = json.menu;
    const jsonMenuLength = jsonMenu.length;
    for (let i = 0, l = jsonMenuLength; i < l; i++) {
      const current = jsonMenu[i];

      const item = new MenuItem(
        current.id,
        current.name
      );

      const tagsCount = current.tags.length;
      for(let j = 0; j < tagsCount; j++)
        item.tags.push(current.tags[j]);

      this.menu.push(item);
    }

    const jsonTags = json.tags;
    const jsonTagsLength = jsonTags.length;
    for (let i = 0, l = jsonTagsLength; i < l; i++)
      this.tags.push(jsonTags[i]);
  }

  public checkTagSelected(tag: string) : boolean {
    return this.selectedTags.indexOf(tag) > -1;
  }

  public selectEditTagsItem(e: Event) {
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

      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async createTag() : Promise<void> {
    const value = this.createTagOptions.value;
    if(value == '') {
      this.createTagOptions.error = '*Tag is empty';
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
    if(!this.createFoodOptions.imageLoaded) {
      this.createFoodOptions.error = "No image loaded";
      return;
    }

    const response = await fetch('/admin/add/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: this.createFoodOptions.name,
        price: this.createFoodOptions.price,
        description: this.createFoodOptions.description,

        veg: this.createFoodOptions.vegetarian,
        cookTime: `${this.pad(this.createFoodOptions.timeHours)}:${this.pad(this.createFoodOptions.timeMinutes)}:${this.pad(this.createFoodOptions.timeSeconds)}`,

        imageURL: this.createFoodOptions.imageURL
      })
    });

    if(response.status == 200) {
      this.createFoodOptions.vegetarian = true;
      this.createFoodOptions.showImage = this.createFoodOptions.imageLoaded = false;
      this.createFoodOptions.name = this.createFoodOptions.description = this.createFoodOptions.imageURL = '';
      this.createFoodOptions.price = this.createFoodOptions.timeHours = this.createFoodOptions.timeMinutes = this.createFoodOptions.timeSeconds = 0;

      this.modalService.showModal('Creation Successful', 'Item creation as successful');
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

    this.modalService.showError((await response.json()).error);
  }

  public toggleChef() : void {
    this.userPermissionsOptions.isChef = !this.userPermissionsOptions.isChef;
  }

  public setAdmin() : void {
    this.userPermissionsOptions.isAdmin = true;
  }

  public async confirmUserPermissions() : Promise<void> {
    let auth = 1 | (this.userPermissionsOptions.isChef ? 2 : 1) | (this.userPermissionsOptions.isAdmin ? 4 : 1);

    const response = await fetch(`${serverAddress}/admin/user/authorisation/set/${this.userPermissionsOptions.email}/${auth}`, {
      method: 'GET',
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
