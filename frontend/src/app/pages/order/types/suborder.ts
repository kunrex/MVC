export class Suborder {
  constructor(public readonly id: number, public readonly authorName: string, public readonly foodId: number, public readonly foodName: string, public readonly foodPrice: number, public readonly status: string, public quantity: number, public instructions: string, public code: number = 2) { }
}
