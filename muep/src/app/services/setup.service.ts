import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  constructor() { }

  checkSetup(){
    if (localStorage.getItem("schedules") === null) {
      return false;
    }
    else{
      return true;
    }
  }


}
