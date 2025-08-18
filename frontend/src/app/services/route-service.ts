import { Router } from "@angular/router";
import { Injectable } from "@angular/core";

import { AppPath } from "../utils/enums";
import { AuthService } from "./auth-service";
import { ModalService } from "./modal-service";

@Injectable({
  providedIn: "root"
})
export class RouteService {
  constructor(private readonly router: Router, private readonly modalService: ModalService, private readonly authService: AuthService) { }

  public matchRoute(route: string) : boolean {
    return this.router.url == route;
  }

  public async loadLogin() : Promise<void> {
    await this.router.navigate([AppPath.Auth]);
  }

  public async loadDashboard() : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.Dashboard]);
  }

  public async loadNewOrder() : Promise<void> {
    if (this.authService.isLoggedIn()) {
      const response = await this.authService.fetchAuthorization('GET', 'order', null)

      const json = await response.json();

      if (response.status == 200) {
        await this.router.navigate([AppPath.Order, parseInt(json.id), this.authService.getName()]);
        return;
      }

      this.modalService.showError(json.error);
    }
  }

  public async loadOrder(id: number, authorName: string) : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.Order, id, authorName]);
  }

  public async loadUserOrders() : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.UserOrders]);
  }

  public async loadSuborders() : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.Suborders]);
  }

  public async loadAdmin() : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.Admin]);
  }

  public async loadAllOrders() : Promise<void> {
    if (this.authService.isLoggedIn())
      await this.router.navigate([AppPath.AllOrders]);
  }
}
