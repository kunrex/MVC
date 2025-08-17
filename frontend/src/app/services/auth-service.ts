import { Injectable } from "@angular/core";

import { serverAddress } from "../utils/constants";

import { ModalService } from "./modal-service";

const authKey: string = "awt"

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private loggedIn: boolean = false;

  private name: string = '';
  private chef: boolean = false;
  private admin: boolean = false;

  constructor(private readonly modalService: ModalService) {
    const token = localStorage.getItem(authKey);
    this.loggedIn = !!token;

    if(this.loggedIn)
      this.fetchUserDetails().then()
  }

  public isLoggedIn() : boolean { return this.loggedIn; }

  public getName() : string { return this.name; }
  public isChef() : boolean { return this.chef; }
  public isAdmin() : boolean { return this.admin; }

  public registerLogin(token: string, name: string, chef: boolean, admin: boolean) : void {
    if(this.loggedIn)
      return;

    localStorage.setItem(authKey, token);

    this.name = name;
    this.chef = chef;
    this.admin = admin;

    this.loggedIn = true;
  }

  public registerSignOut() {
    if(!this.loggedIn)
      return;

    localStorage.setItem(authKey, '');

    this.name = '';
    this.chef = false;
    this.admin = false;

    this.loggedIn = false;
  }

  public async fetchForm(method: string, path: string, params: URLSearchParams) : Promise<Response> {
    const request: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }

    return await fetch(`${serverAddress}/${path}`, request);
  }

  public async fetchAuthorization(method: string, path: string, jsonBody: any | null) : Promise<Response> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer: ${localStorage.getItem(authKey)}`
    }

    const request: RequestInit = {
      method: method,
      headers: headers,
    }

    if (jsonBody != null) {
      request.body = JSON.stringify(jsonBody)
      headers['Content-Type'] = 'application/json'
    }

    return await fetch(`${serverAddress}/${path}`, request);
  }

  private async fetchUserDetails() : Promise<void> {
    const response = await this.fetchAuthorization('GET', 'user', null);
    const json = await response.json();

    if(response.status == 200) {
      this.name = json.name;
      this.chef = json.chef;
      this.admin = json.admin;

      return;
    }

    this.modalService.showError(json.error);
  }
}
