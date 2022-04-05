import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  constructor() { }

  checkSetup(){
    if (localStorage.getItem("setup") === null) {
      return false;
    }
    else{
      return true;
    }
  }


}
