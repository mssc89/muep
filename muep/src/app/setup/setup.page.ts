import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/response';
import { ScheduleData } from '../models/schedule-data';
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

  types: Array<any> = [
    {id:1, name:"Stacjonarne"},
    {id:2, name:"Niestacjonarne"}
  ];
  cycles: Array<any> = [
    {id:1, name:"Pierwszy stopień"},
    {id:2, name:"Drugi stopień"}
  ]
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
        //obetnij nazwy grup
        for(let grupa of data.message){
          grupa.nameShort = grupa.name.substring(grupa.name.indexOf("grupa"))
        }
        this.groups = data.message;
      }

    });
  }

  done(){
    //podstawowa tablica z danymi planów
    let schedule = new ScheduleData(
      "default",
      {
        type:{ id:this.type, name:this.types.find(x => x.id == this.type).name },
        department:{ id:this.department, name:this.deps.find(x => x.id == this.department).name },
        cycle:{ id:this.cycle, name:this.cycles.find(x => x.id == this.cycle).name },
        year:{ id:this.year, name:this.years.find(x => x.id == this.year).name },
        group:{ id:this.group, name:this.groups.find(x => x.id == this.group).name },
      }
    )
    localStorage.setItem("schedules",JSON.stringify([schedule]))
    this.router.navigate(['/setup/done'])
  }

}
