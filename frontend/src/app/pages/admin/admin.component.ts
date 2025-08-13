import {AfterViewInit, Component} from '@angular/core';

import { Page } from "../../utils/page";

import {RouteService} from "../../services/route.service";
import {AudioService} from "../../services/audio.service";
import {between, serverAddress} from "../../utils/constants";

class MenuItem {
  public readonly tags: string[] = [];
  constructor(public readonly id: number, public readonly name: string) { }
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends Page implements AfterViewInit {
  public tags: string[] = []
  private selectedTags: string[] = []

  public tagTracking(i: number, tag: string) : string {
    return tag;
  }

  public menu: MenuItem[] = []
  public itemTracking(i: number, item: MenuItem) : number {
    return item.id;
  }

  public disableEditTags: boolean = true;
  public selectedEditTagsItem: string = '';

  public createTagError: string = '';
  public createTagValue: string = '';

  public foodName: string = '';
  public foodDescription: string = '';

  public isVegetarian = true;
  public foodPrice: number = 0;

  public foodTimeHours: number = 0;
  public foodTimeMinutes: number = 0;
  public foodTimeSeconds: number = 0;

  public foodImageURL: string = '';
  public imageShow: boolean = false;
  public imageLoaded: boolean = false;

  public addFoodError: string = '';

  public userPermissionsEmail: string = '';
  public userPermissionsError: string = '';

  public userIsChef = false;
  public userIsAdmin = false;
  public userPermissionsId: number = 0;
  public userShowPermissions: boolean = false;

  constructor(routes: RouteService, audioService: AudioService) {
    super(routes, audioService);
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.loadTagsMenu()
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
    const parsed = parseInt(this.selectedEditTagsItem)

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

    this.disableEditTags = false;
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
        foodId: parseInt(this.selectedEditTagsItem),
        tags: this.selectedTags,
      })
    });

    if (response.status == 200) {
      this.selectedEditTagsItem = '';
      this.disableEditTags = true;
    }

    //error modal
  }

  public async createTag() : Promise<void> {
    if(this.createTagValue == '') {
      this.createTagError = '*Tag is empty';
      return;
    }

    if(this.tags.indexOf(this.createTagValue) > -1) {
      this.createTagError = '*Tag already exists';
      return;
    }

    if(!between(this.createTagValue.length, 1, 50)) {
      this.addFoodError = "*Exceeds max length";
      return;
    }

    const response = await fetch(`${serverAddress}/admin/tags/add/${this.createTagValue}`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.status == 200) {
      this.createTagValue = this.createTagError = '';
      return;
    }

    //modal error
  }

  public setVegetarian() : void {
    this.isVegetarian = true;
    this.playClickSFX().then();
  }

  public setNonVegetarian() : void {
    this.isVegetarian = false;
    this.playClickSFX().then();
  }

  public fetchImage() : void {
    this.imageShow = true;
    this.imageLoaded = false;
    this.playClickSFX().then();
  }

  public async addFoodConfirm() {
    if(this.foodName == '' || this.foodDescription == '') {
      this.addFoodError = "Please enter a valid name, price and description";
      return;
    }

    if(!between(this.foodName.length, 1, 100)) {
      this.addFoodError = "Maximum length of food name is 100";
      return;
    }

    if(!between(this.foodDescription.length, 1, 100)) {
      this.addFoodError = "Maximum length of food description is 300";
      return;
    }

    if(!this.imageLoaded) {
      this.addFoodError = "No image loaded";
      return;
    }

    const response = await fetch('/admin/add/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: this.foodName,
        price: this.foodPrice,
        description: this.foodDescription,

        veg: this.isVegetarian,
        cookTime: `${this.pad(this.foodTimeHours)}:${this.pad(this.foodTimeMinutes)}:${this.pad(this.foodTimeSeconds)}`,

        imageURL: this.foodImageURL
      })
    });

    if(response.status == 200) {
      this.foodName = this.foodDescription = this.foodImageURL = '';
      this.foodPrice = this.foodTimeHours = this.foodTimeMinutes = this.foodTimeSeconds = 0;

      this.imageShow = this.imageLoaded = false;
      this.isVegetarian = true;
    }

    //error modal
  }

  public async loadUserPermissions() : Promise<void> {
    if(this.userPermissionsEmail == '') {
      this.userPermissionsError = 'No email provided'
    }

    const response = await fetch(`${serverAddress}/admin/user/authorisation/get/${this.userPermissionsEmail}`, {
      method: 'GET',
      credentials: 'include'
    })

    const json = await response.json();

    if(response.status == 200) {
      this.userShowPermissions = true;

      this.userPermissionsId = json.id;
      const auth = json.authorisation;

      this.userIsChef = (auth & 2) == 2;
      this.userIsAdmin = (auth & 4) == 4;

      return;
    }

    this.userPermissionsError = json.error;
  }

  public toggleChef() : void {
    this.userIsChef = !this.userIsChef;
  }

  public toggleAdmin() : void {
    this.userIsAdmin = true;
  }

  public async confirmUserPermissions() : Promise<void> {
    let auth = 1;
    if (this.userIsChef)
      auth &= 2;
    if (this.userIsAdmin)
      auth &= 4;

    const response = await fetch(`${serverAddress}/admin/user/authorisation/set/${this.userPermissionsId}/${auth}`, {
      method: 'GET',
      credentials: 'include'
    })

    if(response.status == 200) {
      this.clearUserPermissions();

      return;
    }

    //error modal
  }

  public clearUserPermissions() : void {
    this.userPermissionsId = 0;
    this.userIsChef = this.userIsAdmin = false;

    this.userPermissionsEmail = '';
    this.userShowPermissions = false;
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
