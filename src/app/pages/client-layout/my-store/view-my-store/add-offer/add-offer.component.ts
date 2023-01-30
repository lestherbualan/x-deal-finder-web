import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Offers, OfferTypes } from 'src/app/core/model/offers.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { OfferTypesService } from 'src/app/core/services/offer-types.service';
import { OffersService } from 'src/app/core/services/offers.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.scss']
})
export class AddOfferComponent implements OnInit {
  storeId;
  currentUserId:string;
  fromNewClient = false;
  data: Offers = new Offers();
  offerForm: FormGroup;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  isLoadingLookup = false;
  offerTypesLookup: OfferTypes[] = [];
  error;
  thumbnailFile;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private offersService: OffersService,
    private offerTypesService: OfferTypesService,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    public dialogRef: MatDialogRef<AddOfferComponent>
  ) {
    const currentUser = this.storageService.getLoginUser();
    this.currentUserId = currentUser?.userId;
    this.offerForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      due: [new Date(), Validators.required],
      offerTypeId: [null, Validators.required],
      dealOffer: ['', Validators.required],
      location: ['', Validators.required],
    });
    this.initLookup();
    dialogRef.disableClose = true;
  }

  initLookup(){
    this.isLoading = true;
    forkJoin(
      this.offerTypesService.getAll()
  ).subscribe(
      ([getOfferTypesService]) => {
          // do things
          this.offerTypesLookup = getOfferTypesService.data;
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
      }
  )
  }
  ngOnInit(): void {
    if(!this.storeId || this.storeId === "") {
      this.onDismiss();
    }
    if(!this.isNew) {
      this.f['name'].setValue(this.data.name);
      this.f['description'].setValue(this.data.description);
      this.f['due'].setValue(this.data.due);
      this.f['offerTypeId'].setValue(this.data.offerType.offerTypeId);
    }
  }

  ngAfterViewInit(): void {
  }

  get isNew(){ return !this.data || !this.data.offerId || this.data.offerId === "" }

  get formData() {
    return {
      ...this.offerForm.value,
      userId: this.currentUserId,
      offerId: this.data.offerId,
      storeId: this.storeId,
      thumbnail: this.thumbnailFile,
    };
  }

  get f() { return this.offerForm.controls; }

  get thumbnail() {
    return this.isNew ? '' : (this.data.thumbnailFile && this.data.thumbnailFile.url ? this.data.thumbnailFile.url : ''); 
  }

  loadProfilePicture (event) {
    const image: any = document.getElementById("thumbnail");
    const file = event.target.files[0];
    if(file) {
      image.src = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          this.thumbnailFile = {
            fileName: file.name,
            originalFileName: file.name,
            data: reader.result.toString().split(',')[1]
          };
      };
    }
  };

  async onSubmit() {
    if (this.offerForm.valid) {
      const param = this.formData;
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      if(this.isNew){
        dialogData.message = 'Save Offer?';
      }else{
        dialogData.message = 'Update Offer?';
      }
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
          this.isProcessing = true;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          try {
            if(this.fromNewClient){
              this.conFirm.emit(param);
              dialogRef.close();
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
            }else{
              if(this.isNew) {
                console.log(param)
                await this.
                offersService
                  .create(param)
                  .subscribe(
                    async (res) => {
                      if (res.success) {
                        this.conFirm.emit(true);
                        this.snackBar.snackbarSuccess("Saved!");
                        dialogRef.close();
                        this.isProcessing = false;
                        dialogRef.componentInstance.isProcessing = this.isProcessing;
                      } else {
                        this.isProcessing = false;
                        this.error = Array.isArray(res.message)
                          ? res.message[0]
                          : res.message;
                        this.snackBar.snackbarError(this.error);
                        dialogRef.componentInstance.isProcessing = this.isProcessing;
                      }
                    },
                    async (err) => {
                      this.isLoading = false;
                      this.error = Array.isArray(err.message)
                        ? err.message[0]
                        : err.message;
                      this.snackBar.snackbarError(this.error);
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    }
                  );
              }
              else {
                await this.
                offersService
                  .udpdate(param)
                  .subscribe(
                    async (res) => {
                      if (res.success) {
                        this.conFirm.emit(true);
                        this.snackBar.snackbarSuccess("Saved!");
                        dialogRef.close();
                        this.isProcessing = false;
                        dialogRef.componentInstance.isProcessing = this.isProcessing;
                      } else {
                        this.isProcessing = false;
                        this.error = Array.isArray(res.message)
                          ? res.message[0]
                          : res.message;
                        this.snackBar.snackbarError(this.error);
                        dialogRef.componentInstance.isProcessing = this.isProcessing;
                      }
                    },
                    async (err) => {
                      this.isLoading = false;
                      this.error = Array.isArray(err.message)
                        ? err.message[0]
                        : err.message;
                      this.snackBar.snackbarError(this.error);
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    }
                  );
              }
            }
          } catch (e) {
            this.isLoading = false;
            this.error = Array.isArray(e.message) ? e.message[0] : e.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.componentInstance.isProcessing = this.isProcessing;
          }
        }
      });
    }
  }

  getError(key:string){
    return this.f[key].errors;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
  profilePicErrorHandler(event) {
    event.target.src = '../../../../../../assets/img/vector/default_offer.png';
  }
}
