import { Component } from '@angular/core';

import { AuthService } from "@/services/auth-service";
import { RouteService } from "@/services/route-service";
import { AudioService } from "@/services/audio-service";

const numbers = /[0-9]+/;
const symbols = /[$@#&!]+/;
const smallLetters = /[a-z]+/;
const capitalLetters = /[A-Z]+/;

@Component({
  selector: 'auth-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  public signupError: string = '';

  public strength: number = 0;
  public strengthMessage: string = "";

  public readonly colours = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

  constructor(private readonly auth: AuthService, private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async signup(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

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

    const response = await this.auth.fetchForm('POST', 'auth', params);
    const json = await response.json();

    if (response.status == 200) {
      this.auth.registerLogin(json.awt, name, false, false);
      await this.routes.loadDashboard();

      return
    }

    this.signupError = json.error;
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
