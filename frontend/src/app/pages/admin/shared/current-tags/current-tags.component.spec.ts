import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTagsComponent } from './current-tags.component';

describe('CurrentTagsComponent', () => {
  let component: CurrentTagsComponent;
  let fixture: ComponentFixture<CurrentTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentTagsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
