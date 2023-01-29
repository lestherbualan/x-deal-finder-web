import { Files } from "./file.model";
import { Offers } from "./offers.model";
import { User } from "./user.model";

export class Stores {
    storeId: string;
    name: string;
    description: string;
    isApproved: boolean;
    offers: Offers[];
    storeDocuments: StoreDocuments[];
    thumbnailFile: any;
    user: User;
    reviews: number;
    storeReviews: StoreReviews[];
  }
  export class StoreDocuments {
    storeDocumentId?: string;
    file?: Files;
  }

  export class StoreReviews {
    userId: string;
    rate: string;
  }
  