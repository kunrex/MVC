import { Component, Input } from '@angular/core';

import { serverAddress } from "../../../../utils/constants";
import { timeStampPrettyPrint } from "../../../../utils/functions";

import { MenuItem } from "../../types/menu-item";

@Component({
  selector: 'admin-current-menu',
  templateUrl: './current-menu.component.html',
  styleUrls: ['./current-menu.component.scss']
})
export class CurrentMenuComponent {
  public readonly serverAddressProvider = serverAddress;
  public readonly timeStampFunctionProvider: (timestamp: string) => string = timeStampPrettyPrint;

  @Input() public menu: MenuItem[] = [];

  public menuItemsTracking(i: number, item: MenuItem) {
    return item.id
  }

  public tagTracking(i: number, tag: string) : string {
    return tag;
  }
}
