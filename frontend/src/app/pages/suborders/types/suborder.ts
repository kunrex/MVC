export class Suborder {
  constructor(public readonly id: number, public readonly orderId: number, public readonly foodName: string, public readonly quantity: number, public readonly instructions: string, public status: string, public code: number = 1) { }
}
