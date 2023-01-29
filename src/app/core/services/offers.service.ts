import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Offers } from '../model/offers.model';
import { Stores } from '../model/stores.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class OffersService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getByClientAdvanceSearch(params): Observable<ApiResponse<Offers[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.getByClientAdvanceSearch, { params })
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
    );
  }

  getByAdvanceSearchByStore(params): Observable<ApiResponse<Offers[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.getByAdvanceSearchByStore, { params })
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
    );
  }

  getById(offerId: string): Observable<ApiResponse<Offers>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.getById + offerId)
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
    );
  }

  create(data: any): Observable<ApiResponse<Offers>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.create, data)
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Offers>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.update, data)
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
    );
  }

  delete(offerId: string): Observable<ApiResponse<Offers>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.offers.delete + offerId)
    .pipe(
      tap(_ => this.log('offer')),
      catchError(this.handleError('offer', []))
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
