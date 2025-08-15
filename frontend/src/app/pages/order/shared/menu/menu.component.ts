import { Component, Input, Output, EventEmitter } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";
import { timeStampPrettyPrint } from "../../../../utils/functions";

import { AudioService } from "../../../../services/audio-service";

import { MenuItem } from "../../types/menu-item";

@Component({
  selector: 'order-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() public readonly: boolean = false;

  @Input() public tags: string[] = [];
  @Input() public menu: MenuItem[] = [];
  public readonly displayedItems: MenuItem[] = [];

  @Output() public onAdd: EventEmitter<number> = new EventEmitter<number>();

  public readonly serverAddressProvider = serverAddress;
  public readonly timeStampFunctionProvider = timeStampPrettyPrint;

  public selectedTag: string = '';

  constructor(private readonly audioService: AudioService) { }

  public loadItems() : void {
    const count = this.menu.length;
    for(let i = 0; i < count; i++)
      this.displayedItems.push(this.menu[i]);
  }

  public tagTracking(i: number, tag: string) {
    return tag
  }

  public menuItemsTracking(i: number, item: MenuItem) {
    return item.id
  }

  public capitalise(tag: string) {
    return tag.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  public filter(tag: string) : void {
    this.displayedItems.splice(0, this.displayedItems.length);
    const menuCount = this.menu.length;

    if(tag == '') {
      for(let i = 0; i < menuCount; i++) {
        const current = this.menu[i];
        this.displayedItems.push(new MenuItem(current.id, current.name, current.price, current.description, current.cookTime, current.imageUrl, current.vegetarian));
      }
    } else {
      for(let i = 0; i < menuCount; i++) {
        const current = this.menu[i];

        if (current.tags.indexOf(tag) > -1)
          this.displayedItems.push(new MenuItem(current.id, current.name, current.price, current.description, current.cookTime, current.imageUrl, current.vegetarian));
      }
    }

    this.selectedTag = tag;
    this.audioService.playClickSFX().then()
  }
}
