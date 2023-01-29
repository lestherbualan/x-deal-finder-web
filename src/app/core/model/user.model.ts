import { Gender } from "./gender.model";
import { Stores } from "./stores.model";

export class User  {
  userId: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  birthDate: string;
  address: string;
  mobileNumber: string;
  username: string;
  isLock: boolean;
  isAdminUserType: boolean;
  isAdminApproved: boolean;
  gender: Gender;
  stores: Stores[];
  profilePictureFile: any;
}

