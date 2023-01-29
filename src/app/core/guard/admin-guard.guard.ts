import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private storageService: StorageService, private route: ActivatedRoute) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    const user = this.storageService.getLoginUser();
    if (!user) {
      // Clear session storage
      this.storageService.saveLoginUser(null);
      // Store the attempted URL for redirecting
      this.authService.redirectUrl = url;
      // Navigate to the login page with extras
      this.router.navigate(['/admin/auth/login'], { replaceUrl: true, state: {title: this.route.snapshot.data['title']} });
       return false;
    }

    //check user type
    if(!user.isAdminUserType) {
      // Clear session storage
      this.storageService.saveLoginUser(null);
      // Store the attempted URL for redirecting
      this.authService.redirectUrl = url;
      // Navigate to the client login page with extras
      this.router.navigate(['/auth/login'], { replaceUrl: true, state: {title: this.route.snapshot.data['title']} });
       return false;
    }

    return true;
  }
}
