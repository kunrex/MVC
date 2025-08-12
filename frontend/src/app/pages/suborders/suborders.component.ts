import { Component, AfterViewInit } from '@angular/core';
import {Page} from "../page";

import {RouteService} from "../../services/route-service";
import {AudioService} from "../../services/audio-service";
import {serverAddress} from "../../utils";

class Suborder {
  constructor(public readonly id: number, public readonly foodName: string, public readonly quantity: number, public readonly instructions: string, public status: string, public readonly code: number = 1) { }
}

@Component({
  selector: 'app-suborders',
  templateUrl: './suborders.component.html',
  styleUrls: ['./suborders.component.scss']
})
export class SubordersComponent extends Page implements AfterViewInit {
  public suborders: Suborder[] = [];

  public readonly ordered = 'ordered';
  public readonly completed = 'completed';
  public readonly processing = 'processing';

  constructor(routes: RouteService, audioService: AudioService) {
    super(routes, audioService);
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

    if (response.status == 200) {
      const json = await response.json();

      const jsonLength = json.length;
      for(let i = 0; i < jsonLength; i++) {
        const current = json[i]

        this.suborders.push(new Suborder(
          current.id,
          current.foodId,
          current.quantity,
          current.instructions,
          current.status
        ));
      }

      return;
    }

    //error modal
  }

  public suborderTracking(index: number, suborder: Suborder) : number {
    return suborder.id;
  }

  public markProcessing(suborderId: number) : void {
    const count = this.suborders.length;
    for(let i = 0; i < count; i++) {
      const current = this.suborders[i];

      if(current.id == suborderId)
      {
        current.status = this.processing;
        break;
      }
    }
  }

  public markCompleted(suborderId: number) : void {
    const count = this.suborders.length;
    for(let i = 0; i < count; i++) {
      const current = this.suborders[i];

      if(current.id == suborderId)
      {
        current.status = this.completed;
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
    {
      await this.routes.loadDashboard()
      return;
    }

    const response = await fetch(`${serverAddress}/suborders/incomplete/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(changes)
    });

    if (response.status == 200) {
      await this.routes.loadDashboard();
      return;
    }

    //error modal
  }

  public loadDashboard() : Promise<void> {
    return this.routes.loadDashboard();
  }
}
