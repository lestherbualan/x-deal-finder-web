import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdminUsersComponent } from './add-admin-users.component';

describe('AddAdminUsersComponent', () => {
  let component: AddAdminUsersComponent;
  let fixture: ComponentFixture<AddAdminUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAdminUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
