import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClientUsersComponent } from './view-client-users.component';

describe('ViewClientUsersComponent', () => {
  let component: ViewClientUsersComponent;
  let fixture: ComponentFixture<ViewClientUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewClientUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewClientUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
