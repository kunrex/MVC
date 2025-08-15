import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOptionsComponent } from './customer-options.component';

describe('CustomerOptionsComponent', () => {
  let component: CustomerOptionsComponent;
  let fixture: ComponentFixture<CustomerOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
