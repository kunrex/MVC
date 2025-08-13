import { Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {serverAddress} from "../../utils/constants";
import {Page} from "../../utils/page";
import {RouteService} from "../../services/route.service";
import {AudioService} from "../../services/audio.service";

class MenuItem {
  public readonly tags: string[] = [];

  constructor(public readonly id: number, public readonly name: string, public readonly price: number, public readonly description: string, public readonly cookTime: string, public readonly imageUrl: string, public readonly vegetarian: boolean) { }
}

class Suborder {
  constructor(public readonly id: number, public readonly authorName: string, public readonly foodId: number, public readonly foodName: string, public readonly foodPrice: number, public readonly status: string, public quantity: number, public instructions: string, public code: number = 2) { }
}

const naturalNumber = /^[1-9][0-9]*$/

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent extends Page implements AfterViewInit {
  public orderId: number = 0;
  public authorName: string = '';
  public readonly: boolean = false;

  public payable: boolean = false;
  public completable: boolean = false;

  public readonly tags: string[] = [];
  public selectedTag: string = "";

  private readonly menuItems: MenuItem[] = []
  public readonly displayedItems: MenuItem[] = [];

  public suborders: Suborder[] = []

  public readonly ordered = 'ordered'
  public readonly processing = 'processing'
  public readonly serverAddressProvider = serverAddress;

  public tip: number = 0;
  public discount: number = 0;

  public total: number = 0;
  public subtotal: number = 0;

  private maxSuborderId: number = 0;

  constructor(private readonly route: ActivatedRoute, routes: RouteService, audioService: AudioService,) {
    super(routes, audioService);

    route.params.subscribe(params => {
      const orderId = params['id'];
      if (!naturalNumber.test(orderId)) {
        //error modal
      }

      this.orderId = parseInt(orderId);
      this.authorName = params['authorName'];
      this.readonly = params['readonly'] == 'true';
    })
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await fetch(`${serverAddress}/menu`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status == 200) {
      const json = await response.json();
      const jsonTags = json.tags;
      const jsonMenu = json.menu;

      const tagCount = jsonTags.length;
      for(let i = 0; i < tagCount; i++)
        this.tags.push(jsonTags[i]);

      const itemCount = jsonMenu.length;
      for(let i = 0; i < itemCount; i++)
      {
        const current = jsonMenu[i];

        const item = new MenuItem(
          current.id,
          current.name,
          current.price,
          current.description,
          current.cookTime,
          current.vegetarian,
          current.imageUrl
        );

        const itemTags = current.tags.split(',')
        for(let i = 0; i < itemTags.length; i++)
          current.tags.push(itemTags[i]);

        this.menuItems.push(item);
        this.displayedItems.push(Object.assign({}, item));
      }

      return;
    }

    //error modal
  }

  private async loadOrderDetails() : Promise<void> {
    const response = await fetch(`${serverAddress}/order/${this.orderId}/${this.authorName}`, {
      method: 'GET',
      credentials: 'include',
    });

    if(response.status == 200) {
      const json = await response.json();

      this.payable = !json.payed;
      this.completable = !json.completed
    }
  }

  private async loadSuborders() : Promise<void> {
    const response = await fetch(`${serverAddress}/suborders/${this.orderId}/${this.authorName}`, {
      method: 'GET',
      credentials: 'include',
    });

    if(response.status == 200) {
      const json = await response.json();

      const suborderCount = json.length;
      for(let i = 0; i < suborderCount; i++) {
        const current = json[i]

        this.suborders.push(new Suborder(
          current.id,
          current.authorName,
          current.foodId,
          current.foodName,
          current.foodPrice,
          current.status,
          current.quantity,
          current.instructions,
        ));
      }
    }

    //error modal
  }

  public async ngAfterViewInit(): Promise<void> {
    if (!this.routes.isLoggedIn()) {
      await this.routes.loadLogin();
      return;
    }

    await this.loadTagsMenu();
    await this.loadOrderDetails();
    await this.loadSuborders();
  }

  public tagTracking(i: number, tag: string) {
    return tag
  }

  public menuItemsTracking(i: number, item: MenuItem) {
    return item.id
  }

  public subordersTracking(i: number, suborder: Suborder) {
    return suborder.id
  }

  public capitalise(tag: string) {
    return tag.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  public formatInstructions(instructions: string) : string {
    return instructions === '' ? 'No instructions' : instructions;
  }

  public filter(tag: string) : void {
    this.displayedItems.splice(0, this.selectedTag.length);
    const menuCount = this.menuItems.length;
    for(let i = 0; i < menuCount; i++) {
      const current = this.menuItems[i];

      if (current.tags.indexOf(tag) > -1)
        this.displayedItems.push(new MenuItem(current.id, current.name, current.price, current.description, current.cookTime, current.description, current.vegetarian));
    }

    this.selectedTag = tag;
  }

  public addItem(itemId: number) : void{
    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++)
      if (this.suborders[i].foodId == itemId && this.suborders[i].status == 'ordered') {
        this.incrementSuborder(this.suborders[i].id);
        return;
      }

    let menuItem : MenuItem | undefined = undefined;
    const menuCount = this.menuItems.length;
    for(let i = 0; i < menuCount; i++)
      if(this.menuItems[i].id == itemId) {
        menuItem = this.menuItems[i]
        break
      }

    if (menuItem == undefined)
      return;

    this.suborders.push(new Suborder(
      this.maxSuborderId++,
      this.routes.getLocalName(),
      menuItem.id,
      menuItem.name,
      menuItem.price,
      'ordered',
      1,
      ""
    ));

    this.completable = this.payable = false;
  }

  public incrementSuborder(suborderId: number) : void {
    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if (suborder.id == suborderId) {
        suborder.quantity++;
        this.subtotal += suborder.foodPrice;

        this.calculateTotal();

        this.completable = this.payable = false;
        return;
      }
    }
  }

  public decrementSuborder(suborderId: number) : void {
    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if (suborder.id == suborderId) {
        suborder.quantity--;
        this.subtotal -= suborder.foodPrice;

        this.calculateTotal();

        this.completable = this.payable = false;
        return;
      }
    }
  }

  public async confirmChanges() : Promise<void> {
    const suborderCount = this.suborders.length;

    const changes: Suborder[] = []
    for (let i = 0; i < suborderCount; i++) {
      const current = this.suborders[i]

      if (current.code != 2)
        changes.push(current)
    }

    if (changes.length == 0) {
      await this.routes.loadDashboard();
      return;
    }

    const response = await fetch(`${serverAddress}/suborders/update/${this.orderId}/${this.authorName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(changes)
    });

    if (response.status == 200) {
      await this.routes.loadDashboard();
      return;
    }

    //error modal
  }

  public async completeOrder() : Promise<void> {
    const response = await fetch(`${serverAddress}/order/complete/${this.orderId}/${this.authorName}`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.status == 200) {
      this.payable = true;
      this.completable = false;

      return;
    }

    //error modal
  }

  public async completeOrderPayment() : Promise<void> {
    const response = await fetch(`${serverAddress}/order/pay/${this.orderId}/${this.authorName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: this.tip.toString()
    })

    if (response.status == 200) {
      this.payable = false;

      return;
    }
  }

  public setTip(tip: number) {
    this.tip = tip;
  }

  private calculateTotal() {
    this.total = this.subtotal * (100 - this.discount) / 100 + this.tip
  }
}
