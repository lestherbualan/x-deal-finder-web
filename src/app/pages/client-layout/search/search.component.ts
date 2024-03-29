import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { Offers, OfferTypes } from 'src/app/core/model/offers.model';
import { Stores } from 'src/app/core/model/stores.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { OfferTypesService } from 'src/app/core/services/offer-types.service';
import { OffersService } from 'src/app/core/services/offers.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { OfferDetailsComponent } from './offer-details/offer-details.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent implements OnInit {
  error;

  isLoading = false;
  searchOfferData: Offers[] = [];
  currentOffersToShow: Offers[] = [];
  currentUserId:string;
  isLoadingLookup = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchKeywordCtrl = new FormControl('');
  offerTypeCtrl = new FormControl('');
  offerTypesLookup: OfferTypes[] = [];
  filteredOfferType: Observable<string[]>;
  selectedOfferType: string[] = [];
  @ViewChild('offerTypeInput') offerTypeInput: ElementRef<HTMLInputElement>;
  constructor(
    private offersService: OffersService,
    private offerTypesService: OfferTypesService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private appConfigService: AppConfigService,
    private titleService: Title,
    private snackBar: Snackbar) {
      this.currentUserId = this.storageService.getLoginUser().userId;
      const title = this.route.data['value'].title;
      this.titleService.setTitle(`${title} ${this.appConfigService.config.appTitle}`);
      this.initLookup();
     }

  get allOfferTypes() {
    const _items: OfferTypes[] = [];
    this.offerTypesLookup.forEach((i: OfferTypes) => {
      _items.push(i);
    });
    return _items.map(x=>{ return x.name });
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
            map((value: string | null) => (value ? this.allOfferTypes.sort().filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allOfferTypes.sort().slice())),
          );
      },
      (error) => console.error(error),
      () => {
        this.isLoadingLookup = false;
      }
  )
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        if(params['q'] && params['q'] !==''){
          this.searchKeywordCtrl.setValue(params['q']);
        }
        if(params['t'] && params['t'] !=='') {
          this.selectedOfferType = params['t'].split(',');
        }
        this.initSearch();
      }
    );
  }

  async handleSearch() {
    const keyword = encodeURI(this.searchKeywordCtrl.value);
    this.router.navigateByUrl('/search?q=' + keyword);
    await this.initSearch();
  }

  async initSearch() {
    this.isLoading = true;
    const keyword = this.searchKeywordCtrl.value ? this.searchKeywordCtrl.value : '';
    try{
      const res = await this.offersService.getByClientAdvanceSearch({
        userId: this.currentUserId,
        key: keyword,
        dueDate: moment().format("YYYY-MM-DD"),
        offerTypes: this.selectedOfferType.toString()
      }).toPromise();
      if (res.success) {
        this.isLoading = false;
        this.searchOfferData = res.data;
        this.currentOffersToShow = res.data.slice(0 * 15, 0* 15 + 15);
      } else {
        this.isLoading = false;
        this.error = Array.isArray(res.message) ? res.message[0] : res.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/admin/client-stores/']);
        }
      }
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/admin/client-stores/']);
      }
    }
  }

  async viewOffer(offer) {
    const dialogRef = this.dialog.open(OfferDetailsComponent, {
      closeOnNavigation: true,
      panelClass: 'view-offer-dialog',
    });
    dialogRef.componentInstance.offerId = offer.offerId;
    dialogRef.componentInstance.showStoreDetailsButton = true;
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../../assets//img/vector/default_offer.png';
  }
  
  onPageChange($event) {
    this.currentOffersToShow =  this.searchOfferData.slice($event.pageIndex*$event.pageSize, $event.pageIndex*$event.pageSize + $event.pageSize);
  }
}
