import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Offers } from 'src/app/core/model/offers.model';
import { OffersService } from 'src/app/core/services/offers.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent  implements OnInit {
  showStoreDetailsButton = true;
  offerId;
  data: Offers;
  isLoading = false;
  error;
  constructor(
    public dialogRef: MatDialogRef<OfferDetailsComponent>,
    private offersService: OffersService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: Snackbar) { 
    }

  get getThumbnail() {
    return this.data && this.data.thumbnailFile ? this.data.thumbnailFile.url : ''; 
  }

  ngOnInit(): void {
    this.initOffer(this.offerId);
  }
  async initOffer(offerId:string){
    this.error = false;
    this.isLoading = true;
    try{
      await this.offersService.getById(offerId)
      .subscribe(async res => {
        if (res.success) {
          this.data = res.data;
          console.log(this.data)
          this.isLoading = false;
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

  get hasError() {
    return this.error && this.error !== undefined;
  }

  async storeDetails() {
    this.router.navigateByUrl('search/store/details/' + this.data.store.storeId);
    this.dialogRef.close();
  }

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_offer.png';
  }
}
