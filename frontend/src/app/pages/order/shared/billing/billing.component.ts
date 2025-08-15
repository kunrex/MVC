import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { AudioService } from "../../../../services/audio-service";

@Component({
  selector: 'order-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnChanges {
  @Input() public subtotal: number = 0;

  @Output() public onTip: EventEmitter<number> = new EventEmitter<number>();
  @Output() public onTotal: EventEmitter<number> = new EventEmitter<number>();
  @Output() public onDiscount: EventEmitter<number> = new EventEmitter<number>();

  public tip: number = 0;
  public total: number = 0;
  public discount: number = 0;

  constructor(private readonly audioService: AudioService) { }

  public ngOnChanges() : void {
    this.calculateTotal();
  }

  public setTip(tip: number) : void {
    this.tip = tip;
    this.onTip.emit(tip);

    this.audioService.playClickSFX().then();

    this.calculateTotal();
  }

  private calculateTotal() {
    this.discount = 0;
    if(this.subtotal > 2000)
      this.discount = 10;
    else if(this.subtotal > 1000)
      this.discount = 5;

    this.total = this.subtotal * (100 - this.discount) / 100 + this.tip

    this.onTotal.emit(this.total);
    this.onDiscount.emit(this.discount);
  }
}
