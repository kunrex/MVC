import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'admin-current-tags',
  templateUrl: './current-tags.component.html',
  styleUrls: ['./current-tags.component.scss']
})
export class CurrentTagsComponent {
  @Input() public tags: string[] = [];

  public tagTracking(i: number, tag: string) : string {
    return tag;
  }
}
