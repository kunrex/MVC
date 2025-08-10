import { Component } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";

import { Page } from "../page";
import { serverAddress } from "../../utils";

import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends Page {
  private readonly passwordInput : HTMLInputElement;

  private readonly strengthBar : HTMLElement;
  private readonly strengthText : HTMLElement;

  private readonly login: HTMLFormElement;
  private readonly loginError : HTMLElement;
  private readonly loginButton : HTMLButtonElement;

  private readonly signup : HTMLFormElement;
  private readonly signUpError : HTMLElement;
  private readonly signUpButton : HTMLButtonElement;

  private readonly colours : string[] = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success']

  constructor(route: ActivatedRoute, routes: RouteService, audio: AudioService) {
    super(route, routes, audio);

    this.passwordInput = document.getElementById('sign-pwd') as HTMLInputElement;

    this.strengthBar = document.getElementById('strength') as HTMLElement;
    this.strengthText = document.getElementById('strength-text') as HTMLElement;

    this.login = document.getElementById("login") as HTMLFormElement;
    this.signup = document.getElementById("signup") as HTMLFormElement;

    this.loginButton = document.getElementById('login-btn') as HTMLButtonElement;
    this.signUpButton = document.getElementById('signup-btn') as HTMLButtonElement;

    this.loginError = document.getElementById('login-error') as HTMLElement;
    this.signUpError = document.getElementById('signup-error') as HTMLElement;

    this.initLogIn();
    this.initSignUp();

    this.passwordInput.onkeyup = (e) => {
      this.checkPassword(this.passwordInput.value);
    }
  }

  protected override onPageOpen(params: Params) {
    if (this.routes.isLoggedIn()) {
      this.routes.loadDashBoard().then();
    }
  }

  private initSignUp() : void {
    this.signup.onsubmit = async (e) => {
      e.preventDefault();

      if (!this.signup.checkValidity()) {
        this.signup.reportValidity();
        return;
      }

      const params = new URLSearchParams();
      const formData = new FormData(this.signup);

      const name = formData.get('name') as string;

      params.set("action", 'signup');

      params.set("name", name);
      params.set("email", formData.get('email') as string);
      params.set("password", formData.get('password') as string);

      const response = await fetch(`${serverAddress}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (response.status == 200) {
        this.routes.registerLogin(name);

        await this.routes.loadDashBoard();
        return
      }

      const json = await response.json();
      this.signUpError.textContent = json.error;
    }
  }

  private initLogIn() : void {
    this.login.onsubmit = async (e) => {
      e.preventDefault();

      if (!this.login.checkValidity()) {
        this.login.reportValidity();
        return;
      }

      const params = new URLSearchParams();
      const formData = new FormData(this.login);

      params.set("action", 'login');
      params.set("email", formData.get('email') as string);
      params.set("password", formData.get('password') as string);

      const response = await fetch(`${serverAddress}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (response.status == 200) {
        this.routes.registerLogin(await response.text());

        await this.routes.loadDashBoard();
        return
      }

      const json = await response.json();
      this.loginError.textContent = json.error;
    }
  }

  private checkPassword(password: string) {
    let strength = 0;
    if (password.match(/[a-z]+/))
      strength += 1;
    if (password.match(/[A-Z]+/))
      strength += 1;
    if (password.match(/[0-9]+/))
      strength += 1;
    if (password.match(/[$@#&!]+/))
      strength += 1;
    if (password.length >= 8)
      strength += 1;

    if(strength === 0)
      this.strengthText.innerHTML = '';
    else if(strength < 5)
    {
      this.strengthText.innerHTML = 'Recommended length is at least 8 characters with numbers, symbols and both case letters';
      this.strengthText.className = 'text-danger';
    }
    else
    {
      this.strengthText.innerHTML = 'Strong Password';
      this.strengthText.className = 'text-success';
    }

    this.strengthBar.className = `progress-bar ${this.colours[strength - 1]}`;
    this.strengthBar.style.width = (strength * 20) + '%';
  }
}
