import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, forkJoin, startWith, map } from 'rxjs';
import { OfferTypes } from 'src/app/core/model/offers.model';
import { Stores } from 'src/app/core/model/stores.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { OfferTypesService } from 'src/app/core/services/offer-types.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { OfferDetailsComponent } from '../search/offer-details/offer-details.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  error;
  isLoading = false;
  searchStoreData: Stores[] = [];
  noReviewsStoreData: Stores[] = [];
  currentUserId:string;
  constructor(
    private storesService: StoresService,
    private offerTypesService: OfferTypesService,
    private appConfigService: AppConfigService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: Snackbar) {
      this.currentUserId = this.storageService.getLoginUser().userId;
      const title = this.route.data['value'].title;
      this.titleService.setTitle(`${title} ${this.appConfigService.config.appTitle}`);
      this.initTopStore();
     }
     

  ngOnInit(): void {
  }

  getRating(store: Stores) {
    let total = 0;
    for(const r of store.storeReviews) {
      total = total + Number(r.rate);
    }
    return total;
  }

  async initTopStore() {
    this.isLoading = true;
    try{
      await this.storesService.getTopStore({
        userId: this.currentUserId,
      })
      .subscribe(async res => {
        if (res.success) {
          this.isLoading = false;
          for (let index = 0; index < res.data.length; index++) {
            if (res.data[index].reviews <1){
              this.noReviewsStoreData.push(res.data[index])
            }else{
              this.searchStoreData.push(res.data[index])
            }
          }
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_store.png';
  }
}
