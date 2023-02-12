import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { StoreDocuments, Stores } from 'src/app/core/model/stores.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.scss']
})
export class AddStoreComponent implements OnInit {

  currentUserId:string;
  fromNewClient = false;
  data: Stores = new Stores();
  storeForm: FormGroup;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  isLoadingLookup = false;
  storeDocuments: any[] = [];
  error;
  thumbnailFile;
  socialLink;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private storesService: StoresService,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    public dialogRef: MatDialogRef<AddStoreComponent>
  ) {
    const currentUser = this.storageService.getLoginUser();
    this.currentUserId = currentUser?.userId;
    this.storeForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      socialLink: ['']
    });
    dialogRef.disableClose = true;

  }
  ngOnInit(): void {
    if(!this.isNew) {
      this.f['name'].setValue(this.data.name);
      this.f['description'].setValue(this.data.description);
      this.f['socialLink'].setValue(this.data.socialLink);
    }
  }

  ngAfterViewInit(): void {
  }

  get isNew(){ return !this.data || !this.data.storeId || this.data.storeId === "" }

  get formData() {
    return {
      ...this.storeForm.value,
      userId: this.currentUserId,
      storeId: this.data.storeId,
      storeDocuments: this.storeDocuments,
      thumbnail: this.thumbnailFile,
    };
  }

  get f() { return this.storeForm.controls; }

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
    if (this.storeForm.valid) {
      const param = this.formData;
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      if(this.isNew){
        dialogData.message = 'Save Store Request?';
      }else{
        dialogData.message = 'Update Store?';
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
              // for new post store
              if(this.isNew) {
                await this.
                storesService
                  .add(param)
                  .subscribe(
                    async (res) => {
                      if (res.success) {
                        this.conFirm.emit(true);
                        this.snackBar.snackbarSuccess("Store Request Submitted. Please wait for approval!");
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
                storesService
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

  async loadAttachment(event) {
    try{
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.toString();
        const id = this.storeDocuments.length > 0 ? (Number(this.storeDocuments[this.storeDocuments.length - 1].storeDocumentId) + 1) : 1;
        const attachment = {
          storeDocumentId: id,
          storeId: this.data && this.data.storeId ? this.data.storeId : "",
          fileName: file.name,
          originalFileName: file.name,
          data: base64.split(',')[1]
        };
        
        this.storeDocuments.push(attachment);

      };
      reader.onerror = (err) => {
      };
    }
    catch(ex) {
    }
  };

  async removeAttachmentFile(storeDocumentId) {
    this.storeDocuments = this.storeDocuments.filter(x=>x.storeDocumentId !== storeDocumentId);
  }

  getError(key:string){
    return this.f[key].errors;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

  profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/vector/default_store.png';
  }
}
