import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubordersDisplayComponent } from './suborders-display.component';

describe('SubordersDisplayComponent', () => {
  let component: SubordersDisplayComponent;
  let fixture: ComponentFixture<SubordersDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubordersDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubordersDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
