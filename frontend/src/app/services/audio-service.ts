import { Injectable } from "@angular/core";

@Injectable()
export class AudioService {
  private readonly clickSFX: HTMLAudioElement;
  private readonly backgroundMusic: HTMLAudioElement;

  constructor() {
    this.clickSFX = new Audio("assets/audio/click.ogg");
    this.backgroundMusic = new Audio("assets/audio/background.ogg");

    this.clickSFX.load()
    this.backgroundMusic.load();

    this.clickSFX.loop = false
    this.backgroundMusic.loop = true;

    this.clickSFX.volume = .8
    this.backgroundMusic.volume =.2
  }

  public async PlayCLickSFX() : Promise<void> {
    this.clickSFX.pause()
    this.clickSFX.currentTime = 0

    await this.clickSFX.play();
  }

  public async InitBackgroundMusic() : Promise<void> {
    if (!this.backgroundMusic.paused)
      await this.backgroundMusic.play();
  }
}
