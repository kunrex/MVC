import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { ordered, processing, serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

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
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class OrderComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public orderId: number = 0;
  public authorName: string = '';

  public payed: boolean = false;
  public completed: boolean = false;

  public payable: boolean = false;
  public readonly: boolean = false;

  public selectedTag: string = "";
  public readonly tags: string[] = [];

  private readonly menuItems: MenuItem[] = [];
  public readonly displayedItems: MenuItem[] = [];

  public suborders: Suborder[] = [];

  public readonly ordersProvider = ordered;
  public readonly processingProvider = processing;
  public readonly serverAddressProvider = serverAddress;

  public tip: number = 0;
  public discount: number = 0;

  public total: number = 0;
  public subtotal: number = 0;

  private maxSuborderId: number = 0;

  constructor(route: ActivatedRoute, routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(routes, audioService, modalService);

    route.params.subscribe(params => {
      const orderId = params['id'];
      if (!naturalNumber.test(orderId)) {
        this.modalService.showError('invalid order id');
        return;
      }

      this.orderId = parseInt(orderId);
      this.authorName = params['authorName'];
    })
  }

  public async ngAfterViewInit(): Promise<void> {
    if (!this.routes.isLoggedIn())
      return this.routes.loadLogin();

    await this.loadTagsMenu();
    await this.loadOrderDetails();
    await this.loadSuborders();

    this.loaded = true;
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await fetch(`${serverAddress}/menu`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if (response.status == 200) {
      const jsonTags = JSON.parse(json.tags);
      const jsonMenu = JSON.parse(json.menu);

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
          current.imageURL,
          current.vegetarian
        );

        const itemTags = current.tags.split(',')
        for(let i = 0; i < itemTags.length; i++)
          item.tags.push(itemTags[i]);

        this.menuItems.push(item);
        this.displayedItems.push(Object.assign({}, item));
      }

      return;
    }

    this.modalService.showError(json.error);
  }

  private async loadOrderDetails() : Promise<void> {
    const response = await fetch(`${serverAddress}/order/${this.orderId}/${this.authorName}`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if(response.status == 200) {
      this.payed = json.payed;
      this.completed = json.completed;

      this.readonly = this.completed;
      this.payable = this.completed && !this.payed;

      return;
    }

    this.modalService.showError(json.error);
  }

  private async loadSuborders() : Promise<void> {
    const response = await fetch(`${serverAddress}/suborders/${this.orderId}/${this.authorName}`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if(response.status == 200) {
      const suborderCount = json.length;
      for(let i = 0; i < suborderCount; i++) {
        const current = json[i]

        const suborder = new Suborder(
          current.id,
          current.authorName,
          current.foodId,
          current.foodName,
          current.foodPrice,
          current.status,
          current.quantity,
          current.imageURL,
        )

        this.suborders.push(suborder);
        this.subtotal += suborder.foodPrice * suborder.quantity;
      }

      this.calculateTotal();
      return;
    }

    this.modalService.showError(json.error);
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
    this.displayedItems.splice(0, this.displayedItems.length);
    const menuCount = this.menuItems.length;

    if(tag == '') {
      for(let i = 0; i < menuCount; i++) {
        const current = this.menuItems[i];
        this.displayedItems.push(new MenuItem(current.id, current.name, current.price, current.description, current.cookTime, current.imageUrl, current.vegetarian));
      }
    } else {
      for(let i = 0; i < menuCount; i++) {
        const current = this.menuItems[i];

        if (current.tags.indexOf(tag) > -1)
          this.displayedItems.push(new MenuItem(current.id, current.name, current.price, current.description, current.cookTime, current.imageUrl, current.vegetarian));
      }
    }

    this.selectedTag = tag;
    this.playClickSFX().then()
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
      ordered,
      1,
      "",
      1
    ));

    this.subtotal += menuItem.price;
    this.calculateTotal();

    this.completed = this.payed = false;
    this.playClickSFX().then();
  }

  public incrementSuborder(suborderId: number) : void {
    if(this.readonly)
      return;

    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if (suborder.id == suborderId) {
        suborder.quantity++;
        this.subtotal += suborder.foodPrice;

        this.calculateTotal();
        this.playClickSFX().then();
        break;
      }
    }
  }

  public decrementSuborder(suborderId: number) : void {
    if(this.readonly)
      return;

    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if (suborder.id == suborderId && suborder.quantity > 0) {
        suborder.quantity--;
        this.subtotal -= suborder.foodPrice;

        this.calculateTotal();
        this.playClickSFX().then();
        break;
      }
    }
  }

  public async confirmChanges() : Promise<void> {
    await this.playClickSFX();

    const suborderCount = this.suborders.length;

    const changes: Suborder[] = []
    for (let i = 0; i < suborderCount; i++) {
      const current = this.suborders[i]

      if (current.code != 2)
        changes.push(current)
    }

    if (changes.length == 0)
      return this.routes.loadDashboard();

    const response = await fetch(`${serverAddress}/suborders/update/${this.orderId}/${this.authorName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(changes)
    });

    if (response.status == 200)
      return this.routes.loadDashboard();

    this.modalService.showError((await response.json()).error);
  }

  public async completeOrder() : Promise<void> {
    await this.playClickSFX();

    const response = await fetch(`${serverAddress}/order/complete/${this.orderId}/${this.authorName}`, {
      method: 'POST',
      credentials: 'include',
    })

    if (response.status == 200) {
      this.payable = this.readonly = this.completed = true;

      this.modalService.showModal('Completion Successful', 'Order was marked as completed for successfully, no further suborder changes will be allowed');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async completeOrderPayment() : Promise<void> {
    await this.playClickSFX();

    const response = await fetch(`${serverAddress}/order/pay/${this.orderId}/${this.authorName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: this.tip.toString()
    })

    if (response.status == 200) {
      this.payed = true;
      this.payable = false;

      this.modalService.showModal('Payment Successful', 'Order was payed for successfully');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public setTip(tip: number) {
    this.tip = tip;
    this.calculateTotal();
  }

  private calculateTotal() {
    this.total = this.subtotal * (100 - this.discount) / 100 + this.tip
  }
}
