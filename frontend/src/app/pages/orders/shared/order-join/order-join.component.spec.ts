import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderJoinComponent } from './order-join.component';

describe('OrderJoinComponent', () => {
  let component: OrderJoinComponent;
  let fixture: ComponentFixture<OrderJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderJoinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
