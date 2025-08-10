import {ActivatedRoute, Params} from "@angular/router";

import { RouteService } from "../services/route-service";
import { AudioService } from "../services/audio-service";

export abstract class Page {
  protected constructor(protected readonly route: ActivatedRoute, protected readonly routes: RouteService, protected readonly audioService: AudioService) { }

  public ngOnInit() {
    this.route.params.subscribe(params => {
      this.onPageOpen(params);
    })
  }

  protected onPageOpen(params: Params): void { }

  public playClickSFX() : Promise<void> {
    return this.audioService.PlayCLickSFX()
  }
}
