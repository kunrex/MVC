import { Router } from "@angular/router";
import { Injectable } from "@angular/core";

const defaultName: string = "user"
export const NameKey: string = "name"

@Injectable()
export class RouteService {
  private loggedIn: boolean = false;

  constructor(private readonly router: Router) {
    const result = localStorage.getItem(NameKey);
    this.loggedIn = result != null && result != "";
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public getLocalName() : string {
    const result = localStorage.getItem(NameKey);
    return result == null || result == "" ? defaultName : result;
  }

  public async loadLogin() : Promise<void> {
    await this.router.navigate(["/login"]);
  }

  public registerLogin(name: string) {
    this.loggedIn = true;
    localStorage.setItem(NameKey, name)
  }

  public registerSignOut() {
    this.loggedIn = false;
    localStorage.setItem(NameKey, "")
  }

  public async loadDashBoard() : Promise<void> {
    if (this.loggedIn)
      await this.router.navigate(["/dashboard"]);
  }

  public async loadNewOrder() {
    if (this.loggedIn) {
      //fetch
      await this.router.navigate(["/order", this.getLocalName()]);
    }
  }

  public async loadOrder(id: number, authorName: string, readonly: boolean) {
    if (this.loggedIn) {
      if (readonly)
        await this.router.navigate(["/order", id]);
      else
        await this.router.navigate(["/order", id, authorName]);
    }
  }

  public async loadUserOrders() : Promise<void> {
    if (this.loggedIn) {
      await this.router.navigate(["/orders/user"]);
    }
  }

  public async loadSuborders() : Promise<void> {
    if (this.loggedIn) {
      await this.router.navigate(["/suborders"]);
    }
  }

  public async loadAdmin() : Promise<void> {
    if (this.loggedIn) {
      await this.router.navigate(["/admin"]);
    }
  }

  public async loadAllOrders() : Promise<void> {
    if (this.loggedIn) {
      await this.router.navigate(["/orders/all"]);
    }
  }
}
