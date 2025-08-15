export class Order {
  constructor(public readonly id: number, public readonly createdOn: string, public readonly authorName: string, public readonly completed: boolean, public readonly paid: boolean) { }
}
