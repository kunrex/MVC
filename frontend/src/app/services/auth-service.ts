import { Injectable } from "@angular/core";

import { serverAddress } from "../utils/constants";

import { ModalService } from "./modal-service";

const authKey: string = "awt"

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private name: string = '';
  private chef: boolean = false;
  private admin: boolean = false;

  constructor(private readonly modalService: ModalService) { }

  public loggedIn() : boolean {
    return !!localStorage.getItem(authKey);
  }

  public getName() : string { return this.name; }
  public isChef() : boolean { return this.chef; }
  public isAdmin() : boolean { return this.admin; }

  public async fetchUserDetails() : Promise<void> {
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

  public registerLogin(token: string, name: string, chef: boolean, admin: boolean) : void {
    if(this.loggedIn())
      return;

    localStorage.setItem(authKey, token);

    this.name = name;
    this.chef = chef;
    this.admin = admin;
  }

  public registerSignOut() {
    if(!this.loggedIn())
      return;

    localStorage.setItem(authKey, '');

    this.name = '';
    this.chef = false;
    this.admin = false;
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
    if(!this.loggedIn()) {
      this.modalService.showError('Failed to fetch authorisation token, please log in again');
      return new Response(null);
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${localStorage.getItem(authKey)}`
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
}
