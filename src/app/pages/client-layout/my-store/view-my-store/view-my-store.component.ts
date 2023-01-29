import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, map, Observable, startWith, Subscription } from 'rxjs';
import { WebcamCaptureComponent } from 'src/app/component/webcam-capture/webcam-capture.component';
import { Offers, OfferTypes } from 'src/app/core/model/offers.model';
import { Stores } from 'src/app/core/model/stores.model';
import { OfferTypesService } from 'src/app/core/services/offer-types.service';
import { OffersService } from 'src/app/core/services/offers.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { AddStoreComponent } from '../add-store/add-store.component';
import { AddOfferComponent } from './add-offer/add-offer.component';

@Component({
  selector: 'app-view-my-store',
  templateUrl: './view-my-store.component.html',
  styleUrls: ['./view-my-store.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewMyStoreComponent implements OnInit {
  currentUserId:string;
  storeId;
  storeData: Stores = new Stores();
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  isUploading = false;
  error;
  pageSize = 10;
  currentItemsToShow= [];
  showActiveOffers = true;
  offerStatusCtrl = new FormControl('1');

  
  isLoadingLookup = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchKeywordCtrl = new FormControl('');
  offerTypeCtrl = new FormControl('');
  offerTypesLookup: OfferTypes[] = [];
  filteredOfferType: Observable<string[]>;
  selectedOfferType: string[] = [];
  @ViewChild('offerTypeInput') offerTypeInput: ElementRef<HTMLInputElement>;

  profilePictureFile: any;
  constructor(
    private storesService: StoresService,
    private offersService: OffersService,
    private offerTypesService: OfferTypesService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: Snackbar) {
      this.initLookup();

      this.offerStatusCtrl.valueChanges.subscribe(async (selectedValue) => {
        this.getOffers(this.storeId)
      });
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

  isOverdue(date) {
    return new Date(date) < new Date(moment().format("YYYY-MM-DD"));
  }

  isDueToday(date) {
    return new Date(date) <= new Date(moment().format("YYYY-MM-DD"));
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
    const keyword = this.searchKeywordCtrl.value ? this.searchKeywordCtrl.value : '';
    const status = this.offerStatusCtrl.value;
    try{
      await this.offersService.getByAdvanceSearchByStore({
        storeId,
        status,
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_store.png';
  }

  offerThumbErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_offer.png';
  }

  async loadAttachment(event) {
    try{
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.toString();
        const attachment = {
          storeId: this.storeData.storeId,
          fileName: file.name,
          data: base64.split(',')[1]
        };
        this.storeData.storeDocuments.push({
          isUploading: true
        } as any)
        await this.uploadAttachmentFile(attachment);
      };
      reader.onerror = (err) => {
      };
    }
    catch(ex) {
    }
  };
  

  async uploadAttachmentFile(param) {
    try {
      this.isUploading = true;
      await this.storesService
        .addAttachmentFile(param)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.storeData.storeDocuments = res.data;
              this.isUploading = false;
              this.snackBar.snackbarSuccess("Uploaded!");
            } else {
              this.isLoading = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.isUploading = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    } catch (e) {
      this.isUploading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  async openFile(url){
    window.open(url, "_blank")
  }

  async removeAttachmentFile(attachmentsId) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Remove';
      dialogData.message = 'Are you sure you want to remove attachment?';
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
          this.isUploading = true;
          dialogRef.componentInstance.isProcessing = this.isUploading;
          await this.storesService
            .removeAttachmentFile(attachmentsId)
            .subscribe(
              async (res) => {
                if (res.success) {
                  this.storeData.storeDocuments = res.data;
                  this.isUploading = false;
                  this.snackBar.snackbarSuccess("Success!");
                  dialogRef.close();
                  dialogRef.componentInstance.isProcessing = this.isUploading;
                } else {
                  dialogRef.close();
                  this.isLoading = false;
                  dialogRef.componentInstance.isProcessing = this.isUploading;
                  this.error = Array.isArray(res.message)
                    ? res.message[0]
                    : res.message;
                  this.snackBar.snackbarError(this.error);
                }
              },
              async (err) => {
                dialogRef.close();
                this.isUploading = false;
                dialogRef.componentInstance.isProcessing = this.isUploading;
                this.error = Array.isArray(err.message)
                  ? err.message[0]
                  : err.message;
                this.snackBar.snackbarError(this.error);
              }
            );
        } catch (e) {
          dialogRef.close();
          this.isUploading = false;
          dialogRef.componentInstance.isProcessing = this.isUploading;
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
        }
      }
    });
  }

  async onEditStore() {
    const dialogRef = this.dialog.open(AddStoreComponent, {
      closeOnNavigation: true,
      panelClass: 'add-store-dialog',
    });
    dialogRef.componentInstance.data = this.storeData;
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        await this.initStore(this.storeData.storeId);
      }
      dialogRef.close();
    });
  }

  async onAddOffer() {
    const dialogRef = this.dialog.open(AddOfferComponent, {
      closeOnNavigation: true,
      panelClass: 'add-store-dialog',
    });
    dialogRef.componentInstance.storeId = this.storeData.storeId;
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        await this.initStore(this.storeData.storeId);
      }
      dialogRef.close();
    });
  }

  async onEditOffer(offer) {
    const dialogRef = this.dialog.open(AddOfferComponent, {
      closeOnNavigation: true,
      panelClass: 'add-store-dialog',
    });
    dialogRef.componentInstance.data = offer;
    dialogRef.componentInstance.storeId = this.storeData.storeId;
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        await this.initStore(this.storeData.storeId);
      }
      dialogRef.close();
    });
  }
  

  async onDeleteOffer(offerId) {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Remove';
    dialogData.message = 'Are you sure you want to remove offer?';
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
        await this.offersService
          .delete(offerId)
          .subscribe(
            async (res) => {
              if (res.success) {
                await this.getOffers(this.storeId);
                this.snackBar.snackbarSuccess("Success!");
                dialogRef.close();
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                this.isProcessing = false;
              } else {
                dialogRef.close();
                this.isProcessing = false;
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

  async loadProfilePicture (event) {
    const image: any = document.getElementById("profilePicture");
    const file = event.target.files[0];
    if(file) {
      image.src = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        this.profilePictureFile = {
          fileName: file.name,
          originalFileName: file.name,
          data: reader.result.toString().split(',')[1]
        };
        await this.updateStoreThumbnail({ storeId: this.storeData.storeId, thumbnail:this.profilePictureFile });
      };
    }
  };

  async updateStoreThumbnail(params) {
    try {
      this.isUploading = true;
      this.storesService.updateStoreThumbnail(params).subscribe(
        async (res) => {
          if (res.success) {
            this.isUploading = false;
            this.initStore(res.data.storeId);
          } else {
            this.isUploading = false;
            this.error = Array.isArray(res.message)
              ? res.message[0]
              : res.message;
            this.snackBar.snackbarError(this.error);
          }
        },
        async (err) => {
          this.isUploading = false;
          this.error = Array.isArray(err.message)
            ? err.message[0]
            : err.message;
          this.snackBar.snackbarError(this.error);
        }
      );
    } catch (e) {
      this.isUploading = false;
      this.error = Array.isArray(e.message)
        ? e.message[0]
        : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }
  
  
  onPageChange($event) {
    this.currentItemsToShow =  this.storeData.offers.slice($event.pageIndex*$event.pageSize, $event.pageIndex*$event.pageSize + $event.pageSize);
  }
}
