import { TestBed } from '@angular/core/testing';

import { StoreReviewsService } from './store-reviews.service';

describe('StoreReviewsService', () => {
  let service: StoreReviewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreReviewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
