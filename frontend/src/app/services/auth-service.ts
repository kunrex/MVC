import { Injectable } from "@angular/core";

import { serverAddress, Unauthorized } from "@/utils/constants";

import { ModalService } from "./modal-service";

const authKey: string = "awt"

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private useCookies: boolean = false;

  private name: string = '';
  private chef: boolean = false;
  private admin: boolean = false;

  private isLoggedIn: boolean = false;

  constructor(private readonly modalService: ModalService) { }

  public async initAuthorisation() : Promise<void> {
    const response = await fetch(`${serverAddress}/auth/method`);
    if (response.status == 200) {
      this.useCookies = (await response.json()).useCookies;
      await this.fetchUserDetails();
      return;
    }

    this.modalService.showError('failed to get authorisation method');
  }

  public getName() : string { return this.name; }

  public isChef() : boolean { return this.chef; }
  public isAdmin() : boolean { return this.admin; }

  public loggedIn() : boolean {
    return this.isLoggedIn;
  }

  private async fetchUserDetails() : Promise<void> {
    const response = await this.fetchAuthorization('GET', 'user', null);

    if(response.status == 200) {
      const json = await response.json();

      this.name = json.name;
      this.chef = json.chef;
      this.admin = json.admin;

      this.isLoggedIn = true;
      return;
    }

    this.isLoggedIn = false;
  }

  public registerLogin(token: string, name: string, chef: boolean, admin: boolean) : void {
    if(!this.useCookies)
      localStorage.setItem(authKey, token);

    this.name = name;
    this.chef = chef;
    this.admin = admin;

    this.isLoggedIn = true;
  }

  public async registerSignOut() : Promise<void> {
    if(this.useCookies)
      await this.fetchAuthorization('POST', 'user/signout', null);
    else
      localStorage.setItem(authKey, '');

    this.name = '';
    this.chef = false;
    this.admin = false;

    this.isLoggedIn = false;
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
    const response = this.useCookies ? await this.fetchAuthorizationCookie(method, path, jsonBody) : await this.fetchAuthorizationHeader(method, path, jsonBody);
    if(response.status == Unauthorized)
      await this.registerSignOut();

    console.log(response);
    return response;
  }

  private async fetchAuthorizationCookie(method: string, path: string, jsonBody: any | null) : Promise<Response> {
    const headers: Record<string, string> = { }

    const request: RequestInit = {
      method: method,
      headers: headers,
      credentials: 'include'
    }

    if (jsonBody != null) {
      request.body = JSON.stringify(jsonBody)
      headers['Content-Type'] = 'application/json'
    }

    return await fetch(`${serverAddress}/${path}`, request);
  }

  private async fetchAuthorizationHeader(method: string, path: string, jsonBody: any | null): Promise<Response> {
    const token = localStorage.getItem(authKey);
    if(!token) {
      this.modalService.showError('failed to fetch authorisation token, please log in again');
      return new Response(null, { status: 401 });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
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
