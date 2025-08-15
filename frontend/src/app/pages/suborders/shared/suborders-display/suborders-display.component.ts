import { Component, Input } from '@angular/core';

import { completed, ordered, processing } from "../../../../utils/constants";

import { AudioService } from "../../../../services/audio-service";

import { Suborder } from "../../types/suborder";

@Component({
  selector: 'suborders-suborders-display',
  templateUrl: './suborders-display.component.html',
  styleUrls: ['./suborders-display.component.scss']
})
export class SubordersDisplayComponent {
  @Input() public suborders: Suborder[] = [];

  public readonly orderedProvider = ordered;
  public readonly completedProvider = completed;
  public readonly processingProvider = processing;

  constructor(private readonly audioServices: AudioService) { }

  public suborderTracking(i: number, suborder: Suborder) : number {
    return suborder.id;
  }

  public markProcessing(suborderId: number) : void {
    const count = this.suborders.length;
    for(let i = 0; i < count; i++) {
      const current = this.suborders[i];

      if(current.id == suborderId) {
        current.status = this.processingProvider;
        current.code = 0;

        this.audioServices.playClickSFX().then();
        break;
      }
    }
  }

  public markCompleted(suborderId: number) : void {
    const count = this.suborders.length;
    for(let i = 0; i < count; i++) {
      const current = this.suborders[i];

      if(current.id == suborderId) {
        current.status = this.completedProvider;
        current.code = 0;

        this.audioServices.playClickSFX().then();
        break;
      }
    }
  }
}
