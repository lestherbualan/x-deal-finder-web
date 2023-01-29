import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Stores } from 'src/app/core/model/stores.model';
import { OffersService } from 'src/app/core/services/offers.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { ViewOfferComponent } from './view-offer/view-offer.component';

@Component({
  selector: 'app-view-stores',
  templateUrl: './view-stores.component.html',
  styleUrls: ['./view-stores.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewStoresComponent implements OnInit {
  currentUserId:string;
  storeData: Stores;
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  error;
  
  searchKeywordCtrl = new FormControl('');
  
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  constructor(
    private storesService: StoresService,
    private offersService: OffersService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: Snackbar) {
     }

  get getThumbnail() {
    return this.storeData && this.storeData.thumbnailFile ? this.storeData.thumbnailFile.url : '';
  }
  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    const storeId = this.route.snapshot.paramMap.get("storeId");
    this.initStore(storeId);
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
            this.router.navigate(['/admin/client-stores/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/admin/client-stores/']);
        }
      });
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

  async getOffers(storeId:string){
    this.isLoading = true;
    try{
      await this.offersService.getByAdvanceSearchByStore({
        storeId,
        key: this.searchKeywordCtrl.value,
        offerTypeIds: []
      })
      .subscribe(async res => {
        if (res.success) {
          this.isLoading = false;
          const offers = res.data.map((x: any)=> {
            const offer = x as any;
            offer.offerType = x.offerType.name;
            return offer;
          });
          this.storeData.offers = offers;
          this.displayedColumns = ['name', 'description', 'due', 'offerType', 'controls'];
          this.dataSource.data = this.storeData.offers;
          this.dataSource.paginator = this.paginator;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/admin/client-stores/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/admin/client-stores/']);
        }
      });
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

  async approve() {
    const storeId = this.storeData.storeId;
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Approve';
    dialogData.message = 'Are you sure you want to approve store?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color: 'primary',
    };
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel',
    };
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: '400px',
      closeOnNavigation: true,
    });

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirmed: any) => {
      if (confirmed) {
        try {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        await this.storesService
          .approve(storeId)
          .subscribe(
            async (res) => {
              if (res.success) {
                await this.initStore(this.storeData.storeId);
                this.snackBar.snackbarSuccess("Success!");
                dialogRef.close();
                dialogRef.componentInstance.isProcessing = this.isProcessing;
              } else {
                dialogRef.close();
                this.isLoading = false;
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                this.error = Array.isArray(res.message)
                  ? res.message[0]
                  : res.message;
                this.snackBar.snackbarError(this.error);
              }
            },
            async (err) => {
              dialogRef.close();
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(err.message)
                ? err.message[0]
                : err.message;
              this.snackBar.snackbarError(this.error);
            }
          );
      } catch (e) {
        dialogRef.close();
        this.isProcessing = false;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.snackbarError(this.error);
      }
    }
  });
  }

  async onViewOffer(offerId){
    const dialogRef = this.dialog.open(ViewOfferComponent, {
      closeOnNavigation: true,
      panelClass: 'view-offer-dialog',
    });
    dialogRef.componentInstance.offerId = offerId;
  }
  

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_store.png';
  }

}
