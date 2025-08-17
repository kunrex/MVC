import { Component } from '@angular/core';

import { AuthService } from "../../../../services/auth-service";
import { RouteService } from "../../../../services/route-service";
import { AudioService } from "../../../../services/audio-service";

@Component({
  selector: 'login-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginError: string = '';

  constructor(private readonly authService: AuthService, private readonly routes: RouteService, private readonly audioService: AudioService) { }

  public async login(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const params = new URLSearchParams();
    const formData = new FormData(target);

    params.set("action", 'login');
    params.set("email", formData.get('email') as string);
    params.set("password", formData.get('password') as string);

    const response = await this.authService.fetchForm('POST', 'auth', params);
    const json = await response.json();

    if (response.status == 200) {
      this.authService.registerLogin(json.awt, json.name, json.chef, json.admin);
      await this.routes.loadDashboard();

      return
    }

    this.loginError = json.error;
  }
}
