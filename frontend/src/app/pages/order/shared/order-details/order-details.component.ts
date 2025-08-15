import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ordered, processing } from "../../../../utils/constants";

import { Suborder } from "../../types/suborder";

@Component({
  selector: 'order-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {
  @Input() public readonly: boolean = false;

  @Input() public suborders: Suborder[] = [];

  @Output() public onIncrement: EventEmitter<number> = new EventEmitter<number>();
  @Output() public onDecrement: EventEmitter<number> = new EventEmitter<number>();

  public readonly ordersProvider = ordered;
  public readonly processingProvider = processing;

  public subordersTracking(i: number, suborder: Suborder) {
    return suborder.id
  }

  public formatInstructions(instructions: string) : string {
    return instructions == '' ? 'No instructions' : instructions;
  }
}
