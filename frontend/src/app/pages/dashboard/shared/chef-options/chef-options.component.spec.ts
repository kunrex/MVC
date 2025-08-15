import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefOptionsComponent } from './chef-options.component';

describe('ChefOptionsComponent', () => {
  let component: ChefOptionsComponent;
  let fixture: ComponentFixture<ChefOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChefOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
