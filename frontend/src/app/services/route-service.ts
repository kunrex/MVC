import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import {getCookie} from "../utils";

const defaultName = "user"
const loggedInCookie = "loggedIn"

export const NameKey: string = "name"

@Injectable()
export class RouteService {
  private loggedIn: boolean = false;

  constructor(private readonly router: Router) {
    const cookieValue = getCookie(loggedInCookie)
    this.loggedIn = cookieValue != null && cookieValue != "";
  }

  public matchRoute(route: string) : boolean {
    return this.router.url == route;
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

  public registerLogin(name: string) : void {
    this.loggedIn = true;
    localStorage.setItem(NameKey, name)
  }

  public registerSignOut() : Promise<void> {
    this.loggedIn = false;
    localStorage.setItem(NameKey, "")

    return this.loadLogin()
  }

  public async loadDashboard() : Promise<void> {
    if (this.loggedIn)
      await this.router.navigate(["/dashboard"]);
  }

  public async loadNewOrder() : Promise<void> {
    if (this.loggedIn) {
      //fetch
      await this.router.navigate(["/order", this.getLocalName()]);
    }
  }

  public async loadOrder(id: number, authorName: string, readonly: boolean) : Promise<void> {
    if (this.loggedIn) {
      await this.router.navigate(["/order", id, authorName, readonly]);
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
