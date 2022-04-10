import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SetupService } from '../services/setup.service';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate {

  constructor(private setup: SetupService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.setup.checkSetup()) {
      this.router.navigate(['setup']);
      return false;
    }
    return true;
  }

}
