import { TestBed } from '@angular/core/testing';

import { OfferTypesService } from './offer-types.service';

describe('OfferTypesService', () => {
  let service: OfferTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
