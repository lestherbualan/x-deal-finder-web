import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMyStoreComponent } from './view-my-store.component';

describe('ViewMyStoreComponent', () => {
  let component: ViewMyStoreComponent;
  let fixture: ComponentFixture<ViewMyStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMyStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMyStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
