
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Stores } from 'src/app/core/model/stores.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { AddStoreComponent } from './add-store/add-store.component';

@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyStoreComponent implements OnInit {

  currentUserId:string;
  error:string;
  userTypeId = 1;
  myStores: Stores[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;

  isLoadingFilter = false;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private storesService: StoresService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    public router: Router) {
      const currentUser = this.storageService.getLoginUser();
      this.currentUserId = currentUser?.userId;
      this.getMyStores(this.currentUserId);
     }


  ngOnInit(): void {
  }


  async getMyStores(userId){
    try{
      if(this.userTypeId === 1) {
        this.displayedColumns = ['name', 'description', 'status', 'controls'];
        this.isLoading = true;
        await this.storesService.getByClientAdvanceSearch({
          userId,
          key: "",
          offerTypeIds: [],
        })
        .subscribe(async res => {
          if(res.success){
            this.myStores = res.data;
            this.isLoading = false;
          }
          else{
            this.error = Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.snackbarError(this.error);
            this.isLoading = false;
          }
        }, async (err) => {
          this.error = Array.isArray(err.message) ? err.message[0] : err.message;
          this.snackBar.snackbarError(this.error);
          this.isLoading = false;
        });
      }
    }
    catch(e){
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }

  }

  async onOpenAddStore() {
    const dialogRef = this.dialog.open(AddStoreComponent, {
      closeOnNavigation: true,
      panelClass: 'add-store-dialog',
    });
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        await this.getMyStores(this.currentUserId);
      }
      dialogRef.close();
    });
  }

  async onEditStore(store: Stores) {
    const dialogRef = this.dialog.open(AddStoreComponent, {
      closeOnNavigation: true,
      panelClass: 'add-store-dialog',
    });
    dialogRef.componentInstance.data = store;
    dialogRef.componentInstance.storeDocuments = store.storeDocuments;
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        await this.getMyStores(this.currentUserId);
      }
      dialogRef.close();
    });
  }

  async onDeleteStore(storeId) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Remove';
      dialogData.message = 'Are you sure you want to remove store?';
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
            .delete(storeId)
            .subscribe(
              async (res) => {
                if (res.success) {
                  await this.getMyStores(this.currentUserId);
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../../assets/img/vector/default_store.png';
  }

}
