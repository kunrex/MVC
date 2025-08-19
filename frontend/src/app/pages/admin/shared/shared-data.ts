export class Tab {
  constructor(public readonly target: string, public readonly selected: boolean, public readonly label: string) { }
}

export const tabConfig: Tab[] = [
  new Tab("menu", true, "Current Menu and Tags"),
  new Tab("create-tag", false, "Create Tag"),
  new Tab("edit-tags", false, "Edit Item Tags"),
  new Tab("add-food", false, "Add Food Item"),
  new Tab("user-permissions", false, "User Permissions")
];

export function tabTrack(i: number, tab: Tab) : string {
  return tab.target
}
