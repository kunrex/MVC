import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { serverAddress } from "../../utils";
import { RouteService } from "../../services/route-service";
import { AudioService } from "../../services/audio-service";

import { Page } from "../page";

const colours = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success']

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends Page implements AfterViewInit {
  @ViewChild("login") private login!: ElementRef;
  @ViewChild("loginError") private loginError! : ElementRef;

  @ViewChild("signup") private signup! : ElementRef;
  @ViewChild("signupError") private signUpError! : ElementRef;

  @ViewChild("strength") private strengthBar! : ElementRef;
  @ViewChild("strengthText") private strengthText! : ElementRef;
  @ViewChild("passwordInput") private passwordInput! : ElementRef;

  constructor(routes: RouteService, audio: AudioService) {
    super(routes, audio);
  }

  public async ngAfterViewInit() : Promise<void> {
    if (this.routes.isLoggedIn()) {
      await this.routes.loadDashBoard();
      return;
    }

    this.initLogIn();
    this.initSignUp();

    this.passwordInput.nativeElement.onkeyup = () => {
      this.checkPassword(this.passwordInput.nativeElement as HTMLInputElement);
    }
  }

  private initSignUp() : void {
    const signupForm = this.signup.nativeElement as HTMLFormElement;

    signupForm.onsubmit = async (e) => {
      e.preventDefault();

      if (!signupForm.checkValidity()) {
        signupForm.reportValidity();
        return;
      }

      const params = new URLSearchParams();
      const formData = new FormData(signupForm);

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

      const json = await response.json();
      this.signUpError.nativeElement.textContent = json.error;
    }
  }

  private initLogIn() : void {
    const loginForm = this.login.nativeElement as HTMLFormElement;

    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }

      const params = new URLSearchParams();
      const formData = new FormData(loginForm);

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

      const json = await response.json();
      this.loginError.nativeElement.textContent = json.error;
    }
  }

  private checkPassword(element: HTMLInputElement) {
    const password = element.value;

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
      this.strengthText.nativeElement.innerHTML = '';
    else if(strength < 5)
    {
      this.strengthText.nativeElement.innerHTML = 'Recommended length is at least 8 characters with numbers, symbols and both case letters';
      this.strengthText.nativeElement.className = 'text-danger';
    }
    else
    {
      this.strengthText.nativeElement.innerHTML = 'Strong Password';
      this.strengthText.nativeElement.className = 'text-success';
    }

    this.strengthBar.nativeElement.className = `progress-bar ${colours[strength - 1]}`;
    this.strengthBar.nativeElement.style.width = (strength * 20) + '%';
  }
}
