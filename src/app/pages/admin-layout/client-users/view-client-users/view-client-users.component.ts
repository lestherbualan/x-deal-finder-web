import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavItem } from 'src/app/core/model/nav-item';
import { User } from 'src/app/core/model/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-view-client-users',
  templateUrl: './view-client-users.component.html',
  styleUrls: ['./view-client-users.component.scss']
})
export class ViewClientUsersComponent implements OnInit {
  currentUserId:string;
  userData: User;
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  error;
  
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: Snackbar) {
     }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    const userId = this.route.snapshot.paramMap.get("userId");
    this.initUser(userId);
  }

  async initUser(userId:string){
    this.isLoading = true;
    try{
      await this.userService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.isLoading = false;
          this.userData = res.data;

          this.displayedColumns = ['name', 'description', 'status', 'controls'];
          const stores = res.data.stores.map(x=>{
            const store: any = x;
            store.status = x.isApproved ? 'Approved' : 'Pending';
            return store;
          });

          this.dataSource.data = stores;
          this.dataSource.paginator = this.paginator;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/admin/clients/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/admin/clients/']);
        }
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/admin/clients/']);
      }
    }
  }
  
}
