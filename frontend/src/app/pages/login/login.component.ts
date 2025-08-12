import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { serverAddress } from "../../utils";
import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";

import { Page } from "../page";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends Page implements AfterViewInit {
  public error: string = "";

  public strength: number = 0;
  public strengthMessage: string = "";

  public readonly colours = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success']

  constructor(routes: RouteService, audio: AudioService) {
    super(routes, audio);
  }

  public async ngAfterViewInit() : Promise<void> {
    if (this.routes.isLoggedIn()) {
      await this.routes.loadDashBoard();
      return;
    }
  }

  public async signup(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const params = new URLSearchParams();
    const formData = new FormData(target);

    const name = formData.get('name') as string;

    params.set('action', 'signup');

    params.set('name', name);
    params.set('email', formData.get('email') as string);
    params.set('password', formData.get('password') as string);

    const response = await fetch(`${serverAddress}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: params.toString()
    });

    if (response.status == 200) {
      this.routes.registerLogin(name);

      await this.routes.loadDashBoard();
      return
    }

    this.error = (await response.json()).error;
  }

  public async login(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const params = new URLSearchParams();
    const formData = new FormData(target);

    params.set("action", 'login');
    params.set("email", formData.get('email') as string);
    params.set("password", formData.get('password') as string);

    const response = await fetch(`${serverAddress}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: params.toString()
    });

    if (response.status == 200) {
      this.routes.registerLogin(await response.text());

      await this.routes.loadDashBoard();
      return
    }

    this.error = (await response.json()).error;
  }

  public checkPasswordStrength(e: Event) : void {
    const target = e.target as HTMLInputElement;
    const password = target.value;

    this.strength = 0;
    if (password.match(/[a-z]+/))
      this.strength += 1;
    if (password.match(/[A-Z]+/))
      this.strength += 1;
    if (password.match(/[0-9]+/))
      this.strength += 1;
    if (password.match(/[$@#&!]+/))
      this.strength += 1;
    if (password.length >= 8)
      this.strength += 1;

    if(this.strength === 0)
      this.strengthMessage = '';
    else if(this.strength < 5)
      this.strengthMessage = 'Recommended length is at least 8 characters with numbers, symbols and both case letters';
    else
      this.strengthMessage = 'Strong Password';
  }
}
