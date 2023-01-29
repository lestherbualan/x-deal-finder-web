import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientUsersComponent } from './client-users.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { ViewClientUsersComponent } from './view-client-users/view-client-users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const routes: Routes = [
  {
    path: '',
    component: ClientUsersComponent,
    pathMatch: 'full'
  },
  {
    path: ':userId',
    component: ViewClientUsersComponent,
  },
];

@NgModule({
  declarations: [ClientUsersComponent, ViewClientUsersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class ClientUsersModule { }
