export class MenuItem {
  public readonly tags: string[] = [];
  constructor(public readonly id: number, public readonly name: string, public readonly price: number, public readonly description: string, public readonly cookTime: string, public readonly imageUrl: string, public readonly vegetarian: boolean) { }
}
