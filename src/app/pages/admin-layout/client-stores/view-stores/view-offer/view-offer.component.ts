import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Offers } from 'src/app/core/model/offers.model';
import { OffersService } from 'src/app/core/services/offers.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-view-offer',
  templateUrl: './view-offer.component.html',
  styleUrls: ['./view-offer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewOfferComponent implements OnInit {
  offerId;
  data: Offers;
  isLoading = false;
  error;
  constructor(
    private offersService: OffersService,
    private dialog: MatDialog,
    private snackBar: Snackbar) { 
    }

  ngOnInit(): void {
    this.initOffer(this.offerId);
  }

  get getThumbnail() {
    return this.data && this.data.thumbnailFile ? this.data.thumbnailFile.url : ''; 
  }

  async initOffer(offerId:string){
    this.error = false;
    this.isLoading = true;
    try{
      await this.offersService.getById(offerId)
      .subscribe(async res => {
        if (res.success) {
          this.data = res.data;
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../../assets//img//vector/default_offer.png';
  }
}
