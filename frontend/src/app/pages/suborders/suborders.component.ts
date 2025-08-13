import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';

import { Page } from "../../utils/page";
import { completed, ordered, processing, serverAddress } from "../../utils/constants";

import { RouteService } from "../../services/route.service";
import { AudioService } from "../../services/audio.service";
import { ModalService } from "../../services/modal.service";

class Suborder {
  constructor(public readonly id: number, public readonly foodName: string, public readonly quantity: number, public readonly instructions: string, public status: string, public code: number = 1) { }
}

@Component({
  selector: 'app-suborders',
  templateUrl: './suborders.component.html',
  styleUrls: ['./suborders.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class SubordersComponent extends Page implements AfterViewInit {
  public loaded: boolean = false;

  public suborders: Suborder[] = [];

  public readonly orderedProvider = ordered;
  public readonly completedProvider = completed;
  public readonly processingProvider = processing;

  constructor(routes: RouteService, audioService: AudioService, modalService: ModalService) {
    super(routes, audioService, modalService);
  }

  public async ngAfterViewInit(): Promise<void> {
    if(!this.routes.isLoggedIn()) {
      await this.routes.loadLogin();
      return ;
    }

    const response = await fetch(`${serverAddress}/suborders/incomplete`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    if (response.status == 200) {
      const jsonLength = json.length;
      for(let i = 0; i < jsonLength; i++) {
        const current = json[i]

        this.suborders.push(new Suborder(
          current.id,
          current.foodName,
          current.quantity,
          current.instructions,
          current.status
        ));
      }

      this.loaded = true;
      return;
    }

    this.modalService.showError(json.error)
  }

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
        break;
      }
    }
  }

  public async confirmChanges(e: Event) : Promise<void> {
    const changes: Suborder[] = [];

    const suborderCount = this.suborders.length;
    for (let i = 0; i < suborderCount; i++) {
      const suborder = this.suborders[i];

      if(suborder.code < 1)
        changes.push(suborder);
    }

    if(changes.length == 0)
      return this.routes.loadDashboard();

    const response = await fetch(`${serverAddress}/suborders/incomplete/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(changes)
    });

    if (response.status == 200)
      return this.routes.loadDashboard();

    this.modalService.showError((await response.json()).error)
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }
}
