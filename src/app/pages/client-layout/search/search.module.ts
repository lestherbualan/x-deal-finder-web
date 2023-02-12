import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MaterialModule } from 'src/app/material/material.module';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { SearchStoreComponent } from './search-store/search-store.component';
import { StoreDetailsComponent } from './search-store/store-details/store-details.component';
import { RatingComponent } from './search-store/store-details/rating/rating.component';
import { NgxMaterialRatingModule } from 'ngx-material-rating';
import { MatLinkPreviewModule } from '@angular-material-extensions/link-preview';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'store',
    component: SearchStoreComponent,
    data: { title: 'Search store', hideSearch: true }
  },
  {
    path: 'store/details/:storeId',
    component: StoreDetailsComponent,
  },
];


@NgModule({
  declarations: [
    SearchComponent,
    SearchStoreComponent,
    OfferDetailsComponent,
    StoreDetailsComponent,
    RatingComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    NgxMaterialRatingModule,
    MatLinkPreviewModule
  ]
})
export class SearchModule { }
