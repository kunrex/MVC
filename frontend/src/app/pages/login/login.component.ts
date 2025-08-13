
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";

const numbers = /[0-9]+/;
const symbols = /[$@#&!]+/;
const smallLetters = /[a-z]+/;
const capitalLetters = /[A-Z]+/;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class LoginComponent extends Page implements AfterViewInit {
  public strength: number = 0;
  public strengthMessage: string = "";

  public readonly colours = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

  public loginError: string = "";

  constructor(routes: RouteService, audio: AudioService, modal: ModalService) {
    super(routes, audio, modal);
  }

  public async ngAfterViewInit() : Promise<void> {
    if (this.routes.isLoggedIn())
      return this.routes.loadDashboard();
  }

  public async signup(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.playClickSFX();

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

      await this.routes.loadDashboard();
      return
    }

    this.loginError = (await response.json()).error;
  }

  public async login(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.playClickSFX();

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
      this.routes.registerLogin(await response.json());

      await this.routes.loadDashboard();
      return
    }

    this.loginError = (await response.json()).error;
  }

  public checkPasswordStrength(e: Event) : void {
    const target = e.target as HTMLInputElement;
    const password = target.value;

    this.strength = 0;
    if (numbers.test(password))
      this.strength += 1;
    if (symbols.test(password))
      this.strength += 1;
    if (smallLetters.test(password))
      this.strength += 1;
    if (capitalLetters.test(password))
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
