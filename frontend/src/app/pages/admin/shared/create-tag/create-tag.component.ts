import { Component, Input } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";
import { AudioService } from "../../../../services/audio-service";
import { ModalService } from "../../../../services/modal-service";

@Component({
  selector: 'admin-create-tag',
  templateUrl: './create-tag.component.html',
  styleUrls: ['./create-tag.component.scss']
})
export class CreateTagComponent {
  @Input() public tags: string[] = [];

  public createTagError: string = '';

  constructor(private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public async createTag(e: Event) : Promise<void> {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    await this.audioService.playClickSFX();

    if (!target.checkValidity()) {
      target.reportValidity();
      return;
    }

    const formData = new FormData(target);
    const tag = formData.get('tag') as string;

    if(this.tags.indexOf(tag) > -1) {
      this.createTagError = '*Tag already exists';
      return;
    }

    const response = await fetch(`${serverAddress}/admin/tags/add/${tag}`, {
      method: 'POST',
      credentials: 'include',
    })

    if(response.status != 200)
      this.modalService.showError((await response.json()).error);

    this.tags.push(tag);
    this.createTagError = '';
    this.modalService.showModal('Creation Successful', 'Tag creation as successful');
  }
}
