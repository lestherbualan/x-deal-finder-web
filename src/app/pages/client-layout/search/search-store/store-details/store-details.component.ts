import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription, Observable, forkJoin, startWith, map } from 'rxjs';
import { OfferTypes } from 'src/app/core/model/offers.model';
import { Stores } from 'src/app/core/model/stores.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { OfferTypesService } from 'src/app/core/services/offer-types.service';
import { OffersService } from 'src/app/core/services/offers.service';
import { StoreReviewsService } from 'src/app/core/services/store-reviews.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { AddStoreComponent } from '../../../my-store/add-store/add-store.component';
import { AddOfferComponent } from '../../../my-store/view-my-store/add-offer/add-offer.component';
import { OfferDetailsComponent } from '../../offer-details/offer-details.component';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StoreDetailsComponent implements OnInit {
  currentUserId:string;
  storeId;
  storeData: Stores = new Stores();
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  isUploading = false;
  isSubmitingReviews = false;
  error;
  pageSize = 10;
  currentItemsToShow= [];
  rating = new FormControl();
  
  isLoadingLookup = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchKeywordCtrl = new FormControl('');
  offerTypeCtrl = new FormControl('');
  offerTypesLookup: OfferTypes[] = [];
  filteredOfferType: Observable<string[]>;
  selectedOfferType: string[] = [];
  @ViewChild('offerTypeInput') offerTypeInput: ElementRef<HTMLInputElement>;
  constructor(
    private storesService: StoresService,
    private offersService: OffersService,
    private storeReviewsService: StoreReviewsService,
    private offerTypesService: OfferTypesService,
    private appConfigService: AppConfigService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: Snackbar) {
    const title = this.route.data['value'].title;
    this.titleService.setTitle(`${title} ${this.appConfigService.config.appTitle}`);
    this.initLookup();
   }

   ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    this.storeId = this.route.snapshot.paramMap.get("storeId");
    this.initStore(this.storeId);
  }

   initLookup(){
    this.isLoadingLookup = true;
    forkJoin(
      this.offerTypesService.getAll()
  ).subscribe(
      ([getOfferTypesService]) => {
          // do things
          this.offerTypesLookup = getOfferTypesService.data;
          this.filteredOfferType = this.offerTypeCtrl.valueChanges.pipe(
            startWith(null),
            map((value: string | null) => (value ? this.allOfferTypes.filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allOfferTypes.slice())),
          );
      },
      (error) => console.error(error),
      () => {
        this.isLoadingLookup = false;
      }
  )
  }

  get allOfferTypes() {
    const _items: OfferTypes[] = [];
    this.offerTypesLookup.forEach((i: OfferTypes) => {
      _items.push(i);
    });
    return _items.map(x=>{ return x.name });
  }
  
  get offersCount() { return !this.isLoading ? this.storeData && this.storeData.offers.length : 0}

  get getThumbnail() {
    return this.storeData.thumbnailFile ? this.storeData.thumbnailFile.url : '';
  }

  get userStoreReviews() {
      return !this.isLoading && this.storeData && this.storeData.storeReviews.length > 0 && this.storeData.storeReviews.filter(x=>x.userId === this.currentUserId)[0] ? this.storeData.storeReviews.filter(x=>x.userId === this.currentUserId)[0].rate : 0;
  }

  isOverdue(date) {
    return new Date(date) < new Date(moment().format("YYYY-MM-DD"));
  }

  isDueToday(date) {
    return new Date(date) <= new Date(moment().format("YYYY-MM-DD"));
  }

  async onRate(rate) {
    this.isSubmitingReviews = true;
    try {
        await this.
        storeReviewsService
          .create({
            storeId: this.storeId,
            userId: this.currentUserId,
            rate
          })
          .subscribe(
            async (res) => {
              if (res.success) {
                this.snackBar.snackbarSuccess("Reviews posted!");
                this.isSubmitingReviews = false;
                this.initStore(this.storeId)
              } else {
                this.isSubmitingReviews = false;
                this.error = Array.isArray(res.message)
                  ? res.message[0]
                  : res.message;
                this.snackBar.snackbarError(this.error);
              }
            },
            async (err) => {
              this.isSubmitingReviews = false;
              this.error = Array.isArray(err.message)
                ? err.message[0]
                : err.message;
              this.snackBar.snackbarError(this.error);
            }
          );
      }
      catch(e) {
        this.isSubmitingReviews = false;
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.snackbarError(this.error);
      }
  }

  async initStore(storeId:string){
    this.isLoading = true;
    try{
      await this.storesService.getById(storeId)
      .subscribe(async res => {
        if (res.success) {
          this.isLoading = false;
          this.storeData = res.data;
          await this.getOffers(storeId);
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/search/store/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/search/store/']);
        }
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/search/store/']);
      }
    }
  }

  async getOffers(storeId:string){
    this.isLoading = true;
    const keyword = this.searchKeywordCtrl.value ? this.searchKeywordCtrl.value : '';
    try{
      await this.offersService.getByAdvanceSearchByStore({
        storeId,
        status: 1,
        dueDate: moment().format('YYYY-MM-DD'),
        key: keyword,
        offerTypes: this.selectedOfferType.toString()
      })
      .subscribe(async res => {
        if (res.success) {
          this.isLoading = false;
          this.storeData.offers = res.data;
          this.currentItemsToShow = res.data.slice(0 * 15, 0* 15 + 15)
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

  async viewOffer(offer) {
    const dialogRef = this.dialog.open(OfferDetailsComponent, {
      closeOnNavigation: true,
      panelClass: 'view-offer-dialog',
    });
    dialogRef.componentInstance.offerId = offer.offerId;
    dialogRef.componentInstance.showStoreDetailsButton = false;
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOfferType.push(event.option.viewValue);
    this.offerTypeInput.nativeElement.value = '';
    this.offerTypeCtrl.setValue(null);
  }

  async remove(value: string){
    const index = this.selectedOfferType.indexOf(value);

    if (index >= 0) {
      this.selectedOfferType.splice(index, 1);
    }
  }
  
  onPageChange($event) {
    this.currentItemsToShow =  this.storeData.offers.slice($event.pageIndex*$event.pageSize, $event.pageIndex*$event.pageSize + $event.pageSize);
  }
}
