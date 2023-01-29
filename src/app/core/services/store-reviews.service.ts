import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class StoreReviewsService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  create(data: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.storeReviews, data)
    .pipe(
      tap(_ => this.log('store-reviews')),
      catchError(this.handleError('store-reviews', []))
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