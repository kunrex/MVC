import { Component, Input } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";

import { AudioService } from "../../../../services/audio-service";
import { ModalService } from "../../../../services/modal-service";

import { MenuItem } from "../../types/menu-item";

@Component({
  selector: 'admin-add-food',
  templateUrl: './add-food.component.html',
  styleUrls: ['./add-food.component.scss']
})
export class AddFoodComponent {
  @Input() public menu: MenuItem[] = [];

  public vegetarian: boolean = true;
  public imageLoaded: boolean = false;

  public imageURL: string = '';

  public addFoodError: string = '';

  constructor(private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public setVegetarian() : void {
    this.vegetarian = true;
    this.audioService.playClickSFX().then();
  }

  public setNonVegetarian() : void {
    this.vegetarian = false;
    this.audioService.playClickSFX().then();
  }

  public async addFoodConfirm(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const price = parseInt(formData.get('price') as string);

    const hours = parseInt(formData.get('hours') as string);
    const minutes = parseInt(formData.get('minutes') as string);
    const seconds = parseInt(formData.get('seconds') as string);

    if(!this.imageLoaded) {
      this.addFoodError = "No image loaded";
      return;
    }

    const time = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

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

        vegetarian: this.vegetarian,
        cookTime: time,

        imageURL: this.imageURL
      })
    });

    if(response.status != 200) {
      this.modalService.showError((await response.json()).error);
      return;
    }

    const insertId = parseInt(await response.text());

    this.menu.push(new MenuItem(insertId, name, price, description, time, this.imageURL, this.vegetarian));

    target.reset();
    this.vegetarian = true;
    this.imageLoaded = false;
    this.imageURL = this.addFoodError = '';

    this.modalService.showModal('Creation Successful', 'Item creation was successful');
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
