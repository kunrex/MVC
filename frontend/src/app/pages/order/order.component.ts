import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

import { Page } from "../../utils/page";
import { ordered } from "../../utils/constants";

import { AuthService } from "../../services/auth-service";
import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";
import { ModalService } from "../../services/modal-service";

import { MenuItem } from "./types/menu-item";
import { Suborder } from "./types/suborder";
import { MenuComponent } from "./shared/menu/menu.component";
import { SharedOrderModuleModule } from "./shared/shared-order-module.module";

const naturalNumber = /^[1-9][0-9]*$/

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SharedOrderModuleModule
  ]
})
export class OrderComponent extends Page implements AfterViewInit, OnDestroy {
  public loaded: boolean = false;

  public orderId: number = 0;
  public authorName: string = '';

  public payed: boolean = false;
  public completed: boolean = false;

  public payable: boolean = false;
  public readonly: boolean = false;

  public readonly tags: string[] = [];
  public readonly menu: MenuItem[] = [];
  public readonly suborders: Suborder[] = [];

  public tip: number = 0;
  public discount: number = 0;

  public total: number = 0;
  public subtotal: number = 0;

  private maxSuborderId: number = 0;

  @ViewChild(MenuComponent) private readonly menuComponent!: MenuComponent;

  constructor(auth: AuthService, route: ActivatedRoute, routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(auth, routes, audioService, modalService);

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
    if (!this.auth.isLoggedIn())
      return this.routes.loadLogin();

    await this.loadTagsMenu();
    await this.loadOrderDetails();
    await this.loadSuborders();

    this.loaded = true;
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await this.auth.fetchAuthorization('GET', 'menu', null);
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

        this.menu.push(item);
      }

      this.menuComponent.loadItems();
      return;
    }

    this.modalService.showError(json.error);
  }

  private async loadOrderDetails() : Promise<void> {
    const response = await this.auth.fetchAuthorization('GET', `order/${this.orderId}/${this.authorName}`, null);
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
    const response = await this.auth.fetchAuthorization('GET', `suborders/${this.orderId}/${this.authorName}`, null);
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
          current.instructions,
        )

        this.suborders.push(suborder);
        this.subtotal += suborder.foodPrice * suborder.quantity;
      }

      return;
    }

    this.modalService.showError(json.error);
  }

  public addItem(itemId: number) : void {
    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++)
      if (this.suborders[i].foodId == itemId && this.suborders[i].status == 'ordered') {
        this.incrementSuborder(this.suborders[i].id);
        return;
      }

    let menuItem : MenuItem | undefined = undefined;
    const menuCount = this.menu.length;
    for(let i = 0; i < menuCount; i++)
      if(this.menu[i].id == itemId) {
        menuItem = this.menu[i]
        break
      }

    if (menuItem == undefined)
      return;

    this.suborders.push(new Suborder(
      this.maxSuborderId++,
      this.auth.getName(),
      menuItem.id,
      menuItem.name,
      menuItem.price,
      ordered,
      1,
      "",
      1
    ));

    this.subtotal += menuItem.price;

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

        this.playClickSFX().then();
        break;
      }
    }
  }

  private async confirmChanges() : Promise<void> {
    const suborderCount = this.suborders.length;

    const changes: Suborder[] = [];
    for (let i = 0; i < suborderCount; i++) {
      const current = this.suborders[i]

      if (current.code != 2)
        changes.push(current)
    }

    if (changes.length == 0)
      return this.routes.loadDashboard();

    const response = await this.auth.fetchAuthorization('PATCH', `suborders/update/${this.orderId}/${this.authorName}`, changes);

    if (response.status == 200)
      return this.routes.loadDashboard();

    this.modalService.showError((await response.json()).error);
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }

  public async completeOrder() : Promise<void> {
    await this.playClickSFX();

    const response = await this.auth.fetchAuthorization('POST', `order/complete/${this.orderId}/${this.authorName}`, null);

    if (response.status == 200) {
      this.payable = this.readonly = this.completed = true;

      this.modalService.showModal('Completion Successful', 'Order was marked as completed for successfully, no further suborder changes will be allowed');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async completeOrderPayment() : Promise<void> {
    await this.playClickSFX();

    const response = await this.auth.fetchAuthorization('POST', `order/pay/${this.orderId}/${this.authorName}`, {
      'tip': this.tip
    });

    if (response.status == 200) {
      this.payed = true;
      this.payable = false;

      this.modalService.showModal('Payment Successful', 'Order was payed for successfully');
      return;
    }

    this.modalService.showError((await response.json()).error);
  }

  public async ngOnDestroy(): Promise<void> {
    await this.confirmChanges();
  }
}
