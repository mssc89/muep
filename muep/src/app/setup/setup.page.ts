import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/response';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {

  type: Number;
  department: Number;
  cycle: Number;
  year: Number;
  group: Number;

  deps: Array<any>;
  years: Array<any>;
  groups: Array<any>;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    if(localStorage.hasOwnProperty('schedules')){
      this.router.navigate(['/schedule'])
    }
  }

  updateDepsList(){
    this.api
    .getDeps(this.type)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        this.deps = data.message;
      }
    });
  }

  updateYearList(){
    this.api
    .getYears(this.type, this.department, this.cycle)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        this.years = data.message;
      }
    });
  }

  updateGroupList(){
    this.api
    .getGroups(this.type, this.department, this.cycle, this.year)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        this.groups = data.message;
      }
    });
  }

  done(){
    localStorage.setItem("schedules",JSON.stringify([{name:"default",values:{type:this.type, department:this.department, cycle:this.cycle, year:this.year, group:this.group}}]))
    this.router.navigate(['/setup/done'])
  }

}
