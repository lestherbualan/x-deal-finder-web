import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { StoresService } from 'src/app/core/services/stores.service';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-client-stores',
  templateUrl: './client-stores.component.html',
  styleUrls: ['./client-stores.component.scss']
})
export class ClientStoresComponent implements OnInit {

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
    private storesService: StoresService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    public router: Router) {
      const currentUser = this.storageService.getLoginUser();
      this.currentUserId = currentUser?.userId;
      this.getClientStores();
     }


  ngOnInit(): void {
  }


  async getClientStores(){
    try{
      if(this.userTypeId === 1) {
        this.displayedColumns = ['name', 'description', 'owner', 'status', 'controls'];
        this.isLoading = true;
        await this.storesService.getByAdminAdvanceSearch({
          key: this.searchKeywordCtrl.value,
          offerTypeIds: [],
        })
        .subscribe(async res => {
          if(res.success){
            this.dataSource.data = res.data.map((x:any)=> {
              const store: any = x;
              store.status = x.isApproved ? 'Approved' : 'Pending';
              store.owner = `${ x.user.firstName } ${ x.user.lastName }`
              return store;
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

}
