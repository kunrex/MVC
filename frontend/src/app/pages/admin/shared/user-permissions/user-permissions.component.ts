import { Component, AfterViewInit } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";

import { AudioService } from "../../../../services/audio-service";
import { ModalService } from "../../../../services/modal-service";

class UserAuthorisation {
  constructor(public readonly id: number, public readonly name: string, public readonly email: string, public authorisation: number) { }
}

@Component({
  selector: 'admin-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent implements AfterViewInit {
  public readonly users: UserAuthorisation[] = [];

  constructor(private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public async ngAfterViewInit(): Promise<void> {
    const response = await fetch(`${serverAddress}/admin/user/authorisation/get`, {
      method: 'GET',
      credentials: 'include'
    });

    const json = await response.json();

    if(response.status != 200) {
      this.modalService.showError(json.error);
      return;
    }

    const count = json.length;
    for (let i = 0; i < count; i++) {
      const current = json[i];

      this.users.push(new UserAuthorisation(
        current.id,
        current.name,
        current.email,
        current.authorisation
      ));
    }
  }

  public userTracking(i: number, user: UserAuthorisation) : number {
    return user.id;
  }

  public toggleChef(id: number) : void {
    const count = this.users.length;
    for (let i = 0; i < count; i++) {
      const current = this.users[i];

      if(current.id == id) {
        current.authorisation = current.authorisation ^ 2;
        this.setUserAuthorisation(current).then();
        break;
      }
    }

    this.audioService.playClickSFX().then()
  }

  public setAdmin(id: number) : void {
    const count = this.users.length;
    for (let i = 0; i < count; i++) {
      const current = this.users[i];

      if(current.id == id) {
        current.authorisation = current.authorisation | 4;
        this.setUserAuthorisation(current).then();
        break;
      }
    }

    this.audioService.playClickSFX().then();
  }

  public isChef(authorisation: number): boolean {
    return (authorisation & 2) == 2;
  }

  public isAdmin(authorisation: number): boolean {
    return (authorisation & 4) == 4;
  }

  private async setUserAuthorisation(user: UserAuthorisation) : Promise<void> {
    const response = await fetch(`${serverAddress}/admin/user/authorisation/set/${user.id}/${user.authorisation}`, {
      method: 'PATCH',
      credentials: 'include'
    });

    if(response.status != 200)
      this.modalService.showError((await response.json()).error);
  }
}
