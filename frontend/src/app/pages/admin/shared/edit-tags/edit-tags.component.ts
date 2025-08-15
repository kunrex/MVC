import { Component, Input } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";

import { AudioService } from "../../../../services/audio-service";
import { ModalService } from "../../../../services/modal-service";

import { MenuItem } from "../../types/menu-item";

@Component({
  selector: 'admin-edit-tags',
  templateUrl: './edit-tags.component.html',
  styleUrls: ['./edit-tags.component.scss'],
})
export class EditTagsComponent {
  @Input() public tags: string[] = [];
  @Input() public menu: MenuItem[] = [];

  public itemNone: boolean = true;
  public selectedIdValue: string = '';

  private selectedId: number = 0;
  private readonly selectedTags: string[] = []

  constructor(private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public tagTracking(i: number, tag: string) : string {
    return tag;
  }

  public itemTracking(i: number, item: MenuItem) : number {
    return item.id;
  }

  public selectItem(e: Event) : void {
    const target = e.target as HTMLSelectElement;

    this.itemNone = false;
    this.selectedId = parseInt(target.value);
    this.selectedTags.splice(0, this.selectedTags.length);

    const menuCount = this.menu.length;
    for(let i = 0; i < menuCount; i++) {
      const current = this.menu[i];

      if(current.id == this.selectedId) {
        const tagsCount = current.tags.length;
        for(let j = 0; j < tagsCount; j++)
          this.selectedTags.push(current.tags[j]);

        break;
      }
    }
  }

  public toggleTag(tag: string) : void{
    const index = this.selectedTags.indexOf(tag);

    if(index < 0)
      this.selectedTags.push(tag);
    else
      this.selectedTags.splice(index, 1);

    this.audioService.playClickSFX().then();
  }

  public checkTagSelected(tag: string) : boolean {
    return this.selectedTags.indexOf(tag) > -1;
  }

  public async confirmChanges() : Promise<void> {
    await this.audioService.playClickSFX();

    const response = await fetch(`${serverAddress}/admin/food/updateTags`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        foodId: this.selectedId,
        tags: this.selectedTags,
      })
    });

    if (response.status != 200) {
      this.modalService.showError((await response.json()).error);
      return;
    }

    this.itemNone = true;
    this.selectedId = -1;
    this.selectedIdValue = '';
    this.selectedTags.splice(0, this.selectedTags.length);

    this.modalService.showModal('Update successful', 'Item updated successfully');
  }
}
