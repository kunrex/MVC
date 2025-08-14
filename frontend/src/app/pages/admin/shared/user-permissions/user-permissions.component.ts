import { Component } from '@angular/core';
import {serverAddress} from "../../../../utils/constants";
import {AudioService} from "../../../../services/audio-service";
import {ModalService} from "../../../../services/modal-service";

@Component({
  selector: 'admin-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent {
  public userNone: boolean = true;
  public permissionsError: string = '';

  public userEmail: string = '';
  public isChef: boolean = false;
  public isAdmin: boolean = false;

  private userId: number = 0;

  constructor(private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public async loadUser(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);
    this.userEmail = formData.get('email') as string;

    await this.audioService.playClickSFX();

    const response = await fetch(`${serverAddress}/admin/user/authorisation/get/${this.userEmail}`, {
      method: 'GET',
      credentials: 'include'
    })

    const json = await response.json();
    if(response.status != 200) {
      this.permissionsError = json.error;
      return;
    }

    this.userNone = false;

    this.userId = json.id;
    const auth = json.authorisation;

    this.isChef = (auth & 2) == 2;
    this.isAdmin = (auth & 4) == 4;
  }

  public toggleChef() : void {
    this.isChef = !this.isChef;
    this.audioService.playClickSFX().then()
  }

  public setAdmin() : void {
    this.isAdmin = true;
    this.audioService.playClickSFX().then();
  }

  public async confirmChanges() : Promise<void> {
    await this.audioService.playClickSFX();

    let auth = 1 | (this.isChef ? 2 : 1) | (this.isAdmin ? 4 : 1);
    const response = await fetch(`${serverAddress}/admin/user/authorisation/set/${this.userId}/${auth}`, {
      method: 'PATCH',
      credentials: 'include'
    })

    if(response.status != 200) {
      this.modalService.showError((await response.json()).error);
      return;
    }

    this.cancelChanges();
    this.modalService.showModal('Update Successful', 'User permissions updated successfully');
  }

  public cancelChanges() : void {
    this.userId = 0;
    this.isChef = this.isAdmin = false;
    this.userEmail = this.permissionsError = '';

    this.userNone = true;
  }
}
