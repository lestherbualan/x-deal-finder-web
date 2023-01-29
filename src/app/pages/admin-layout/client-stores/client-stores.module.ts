import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStoresComponent } from './client-stores.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { ViewStoresComponent } from './view-stores/view-stores.component';
import { ViewOfferComponent } from './view-stores/view-offer/view-offer.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const routes: Routes = [
  {
    path: '',
    component: ClientStoresComponent,
    pathMatch: 'full'
  },
  {
    path: ':storeId',
    component: ViewStoresComponent
  }
];

@NgModule({
  declarations: [ClientStoresComponent, ViewStoresComponent, ViewOfferComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule.forChild(routes),

  ]
})
export class ClientStoresModule { }
