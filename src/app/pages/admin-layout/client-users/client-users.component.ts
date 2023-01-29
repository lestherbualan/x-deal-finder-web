import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-client-users',
  templateUrl: './client-users.component.html',
  styleUrls: ['./client-users.component.scss']
})
export class ClientUsersComponent implements OnInit {

  currentUserId:string;
  error:string;
  userTypeId = 1;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  searchKeywordCtrl = new FormControl('');

  isLoadingFilter = false;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private userService: UserService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    public router: Router) {
      const currentUser = this.storageService.getLoginUser();
      this.currentUserId = currentUser?.userId;
      this.getUsers();
     }


  ngOnInit(): void {
  }


  async getUsers(){
    try{
      if(this.userTypeId === 1) {
        this.displayedColumns = ['username', 'fullName', 'storeCount', 'mobileNumber', 'birthDate', 'address', 'controls'];
        this.isLoading = true;
        await this.userService.getAllClientUserType({
          keyword: this.searchKeywordCtrl.value
        })
        .subscribe(async res => {
          if(res.success){
            this.dataSource.data = res.data.map(x=> {
              return {
                ...x,
                fullName: `${ x.firstName } ${ x.middleName } ${ x.lastName }`,
                storeCount: x.stores?x.stores.filter(x=>x.isApproved).length:0
              }
            })
            this.dataSource.paginator = this.paginator;
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

  approve(userId:string){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Approve user'
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color:'primary'
    }
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel'
    }
    const dialogRef = this.dialog.open(AlertDialogComponent, {
        maxWidth: '400px',
        closeOnNavigation: true
    })
    dialogRef.componentInstance.alertDialogConfig = dialogData;

    try{

      dialogRef.componentInstance.conFirm.subscribe((data: any) => {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        dialogRef.componentInstance.alertDialogConfig.message = 'Please wait...';
        this.userService.approvedAdminUser({userId})
          .subscribe(async res => {
            if (res.success) {
              this.getUsers();
              this.snackBar.snackbarSuccess('User approved!');
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              dialogRef.close();
            } else {
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.snackbarError(this.error);
              dialogRef.close();
            }
          }, async (err) => {
            this.isProcessing = false;
            dialogRef.componentInstance.isProcessing = this.isProcessing;
            this.error = Array.isArray(err.message) ? err.message[0] : err.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.close();
          });
    });
    } catch (e){
      this.isProcessing = false;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      dialogRef.close();
    }
  }


  toggleLock(userId:string, isLock: boolean){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = isLock ? 'Lock user?' : 'Enable user?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color:'primary'
    }
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel'
    }
    const dialogRef = this.dialog.open(AlertDialogComponent, {
        maxWidth: '400px',
        closeOnNavigation: true
    })
    dialogRef.componentInstance.alertDialogConfig = dialogData;

    try{

      dialogRef.componentInstance.conFirm.subscribe((data: any) => {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        dialogRef.componentInstance.alertDialogConfig.message = 'Please wait...';
        this.userService.toggleLock({ userId, isLock })
          .subscribe(async res => {
            if (res.success) {
              this.getUsers();
              this.snackBar.snackbarSuccess(isLock ? 'User locked!' : 'User enabled!');
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              dialogRef.close();
            } else {
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.snackbarError(this.error);
              dialogRef.close();
            }
          }, async (err) => {
            this.isProcessing = false;
            dialogRef.componentInstance.isProcessing = this.isProcessing;
            this.error = Array.isArray(err.message) ? err.message[0] : err.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.close();
          });
    });
    } catch (e){
      this.isProcessing = false;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      dialogRef.close();
    }
  }

}
