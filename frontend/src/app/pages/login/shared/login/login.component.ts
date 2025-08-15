import { Component } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";
import { RouteService } from "../../../../services/route-service";
import { AudioService } from "../../../../services/audio-service";
import { ModalService } from "../../../../services/modal-service";

@Component({
  selector: 'login-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginError: string = '';

  constructor(private readonly routes: RouteService, private readonly audioService: AudioService) { }

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

      await this.routes.loadDashboard();
      return
    }

    this.loginError = (await response.json()).error;
  }
}
