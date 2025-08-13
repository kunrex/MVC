import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { Modal } from 'bootstrap';

import { RouteService } from "./services/route.service";
import { AudioService } from "./services/audio.service";
import { ModalOptions, ModalService } from "./services/modal.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public title = 'frontend';

  public modalTitle: string = '';
  public modalMessage: string = '';

  @ViewChild('modal') private readonly modalReference!: ElementRef;

  constructor(private readonly routes: RouteService, private readonly audioService: AudioService, private readonly modalService: ModalService) { }

  public ngAfterViewInit() : void {
    const target = this.modalReference.nativeElement;
    const modal = new Modal(target, {
      backdrop: 'static',
      keyboard: false,
    });

    modal.hide()

    this.modalService.appEventObservable().subscribe((data: string) => {
      const options = this.modalService.getOptions(data);

      this.modalTitle = options.title;
      this.modalMessage = options.message;

      target.addEventListener('hidden.bs.modal', () => {
        if(options.loadLogin)
          this.routes.loadLogin().then();

        this.audioService.playCLickSFX().then();
      });

      modal.show();
    });
  }
}
