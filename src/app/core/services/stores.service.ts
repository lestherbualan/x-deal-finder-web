import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { StoreDocuments, Stores } from '../model/stores.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class StoresService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getByAdminAdvanceSearch(params): Observable<ApiResponse<Stores[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.getByAdminAdvanceSearch, { params })
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  getByClientAdvanceSearch(params): Observable<ApiResponse<Stores[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.getByClientAdvanceSearch, { params })
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  getStoreAdvanceSearch(params): Observable<ApiResponse<Stores[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.getStoreAdvanceSearch, { params })
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  getTopStore(params): Observable<ApiResponse<Stores[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.getTopStore, { params })
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  getById(storeId: string): Observable<ApiResponse<Stores>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.getById + storeId)
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  add(data: any): Observable<ApiResponse<Stores>> {
    console.log(data)
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.create, data)
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Stores>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.update, data)
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }

  delete(storeId: string): Observable<ApiResponse<Stores>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.delete + storeId)
    .pipe(
      tap(_ => this.log('store')),
      catchError(this.handleError('store', []))
    );
  }
  
  approve(storeId): Observable<ApiResponse<Stores>> {
    return this.http.put<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.approve + storeId, {}
      )
      .pipe(
        tap((_) => this.log('store')),
        catchError(this.handleError('store', []))
      );
  }

  addAttachmentFile(data: any): Observable<ApiResponse<StoreDocuments[]>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.store.addAttachmentFile,
        data
      )
      .pipe(
        tap((_) => this.log('store')),
        catchError(this.handleError('store', []))
      );
  }
  
  removeAttachmentFile(appointmentAttachmentId): Observable<ApiResponse<StoreDocuments[]>> {
    return this.http
      .delete<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.removeAttachmentFile + appointmentAttachmentId
      )
      .pipe(
        tap((_) => this.log('store')),
        catchError(this.handleError('store', []))
      );
  }
  
  updateStoreThumbnail(data: any){
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.store.updateStoreThumbnail, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

   handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
