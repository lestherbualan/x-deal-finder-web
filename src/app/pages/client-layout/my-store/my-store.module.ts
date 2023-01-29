import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyStoreComponent } from './my-store.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/material/material.module';
import { ViewMyStoreComponent } from './view-my-store/view-my-store.component';
import { AddStoreComponent } from './add-store/add-store.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddOfferComponent } from './view-my-store/add-offer/add-offer.component';
import { NgxPaginationModule } from 'ngx-pagination';

export const routes: Routes = [
  {
    path: '',
    component: MyStoreComponent,
    pathMatch: 'full'
  },
  {
    path: ':storeId',
    component: ViewMyStoreComponent,
  }
];

@NgModule({
  declarations: [MyStoreComponent, ViewMyStoreComponent, AddStoreComponent, AddOfferComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    NgxPaginationModule
  ]
})
export class MyStoreModule { }
