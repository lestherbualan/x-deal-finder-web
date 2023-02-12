import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { CommonModule } from '@angular/common';
import { FormFieldErrorComponent } from './shared/form-field-error/form-field-error.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { AlertDialogComponent } from './shared/alert-dialog/alert-dialog.component';
import { AppConfigService } from './core/services/app-config.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTimepickerModule } from './core/directive/mat-timepicker/src/lib/mat-timepicker.module';
import { MenuListItemComponent } from './shared/menu-list-item/menu-list-item.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './pages/client-layout/client-layout.component';
import { AccountsLayoutComponent } from './pages/accounts-layout/accounts-layout.component';
import { StoreMenuModalComponent } from './component/store-menu-modal/store-menu-modal.component';
import { WebcamCaptureComponent } from './component/webcam-capture/webcam-capture.component';
import { WebcamModule } from 'ngx-webcam';
import { MatLinkPreviewModule } from '@angular-material-extensions/link-preview';

@NgModule({
  declarations: [
    AppComponent,
    ClientLayoutComponent,
    AdminLayoutComponent,
    MenuListItemComponent,
    FormFieldErrorComponent,
    SnackbarComponent,
    AlertDialogComponent,
    AccountsLayoutComponent,
    StoreMenuModalComponent,
    WebcamCaptureComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatTimepickerModule,
    WebcamModule,
    MatLinkPreviewModule.forRoot()
  ],
  providers: [
    Title,
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500} },
    {
      provide : APP_INITIALIZER,
      multi : true,
      deps : [AppConfigService],
      useFactory : (config : AppConfigService) =>  () => config.loadAppConfig()
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
