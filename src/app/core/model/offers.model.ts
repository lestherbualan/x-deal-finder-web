import { Stores } from "./stores.model";

export class Offers {
    offerId: string;
    name: string;
    description: string;
    due: Date;
    offerType: OfferTypes;
    store: Stores;
    thumbnailFile: any;
  }
  
  export class OfferTypes {
    offerTypeId: string;
    name: string;
  }
  