import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/response';
import { ScheduleData } from '../models/schedule-data';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {
  context: String;

  type: Number;
  department: Number;
  cycle: Number;
  year: Number;
  group: Number;
  album: Number;

  types: Array<any> = [
    {id:1, name:"Stacjonarne"},
    {id:2, name:"Niestacjonarne"}
  ];
  cycles: Array<any> = [
    {id:1, name:"Pierwszy stopień"},
    {id:2, name:"Drugi stopień"}
  ];
  deps: Array<any>;
  years: Array<any>;
  groups: Array<any>;

  constructor(private api: ApiService, private router: Router, private storage: StorageService) { }

  ngOnInit() {
    //zdobądź aktualny kontekst (setup/edycja/dodawanie nowego)
    this.context = this.router.url.split('/').pop();
    console.log(this.context)
  }

  updateDepsList(){
    //wyczyść stare dane
    this.department = null;

    //pobierz nowe dane z api
    this.api
    .getDeps(this.type)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        this.deps = data.message;
      }
    });
  }

  updateYearList(){
    //wyczyść stare dane
    this.year = null;

    //pobierz nowe dane z api
    this.api
    .getYears(this.type, this.department, this.cycle)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        this.years = data.message;
      }
    });
  }

  updateGroupList(){
    //wyczyść stare dane
    this.group = null;

    //pobierz nowe dane z api
    this.api
    .getGroups(this.type, this.department, this.cycle, this.year)
    .subscribe((data: ApiResponse) => {
      if (data.status == 'ok') {
        //obetnij nazwy grup
        for(let grupa of data.message){
          //znajdź index obcięcia nazwy (po "Rok I"/"Rok II" itd) - mozna regexem ale jestem leniwy
          let index = 0;
          if(grupa.name.includes("Rok III")){
            index = grupa.name.indexOf("Rok III") + "Rok III ".length;
          }
          else if(grupa.name.includes("Rok II")){
            index = grupa.name.indexOf("Rok II") + "Rok II ".length;
          }
          else{
            index = grupa.name.indexOf("Rok I") + "Rok I ".length;
          }
          //obetnij po numerze roku
          grupa.nameShort = grupa.name.substring(index)
        }
        this.groups = data.message;
      }

    });
  }

  done(){
    //domyślna nazwa planu
    //wez nazwę
    let name = this.groups.find(x => x.id == this.group).name;
    //podziel na słowa
    let slowa = name.split("Rok")[0].split(" ");
    //dla kazdego słowa innego niz wymienione, wez pierwszą literę i zrób uppercase
    for(let i=0;i<slowa.length;i++){
      if(slowa[i] != "i" && slowa[i] != "w" && slowa[i] != "o"){
        slowa[i] = slowa[i].charAt(0).toUpperCase();
      }
    };

    //zmień array słów na stringa
    name = slowa.join('') + " Rok" + name.split("Rok")[1];

    //podstawowa tablica z danymi planów
    let schedule = new ScheduleData(
      name,
      {
        type:{ id:this.type, name:this.types.find(x => x.id == this.type).name },
        department:{ id:this.department, name:this.deps.find(x => x.id == this.department).name },
        cycle:{ id:this.cycle, name:this.cycles.find(x => x.id == this.cycle).name },
        year:{ id:this.year, name:this.years.find(x => x.id == this.year).name },
        group:{ id:this.group, name:this.groups.find(x => x.id == this.group).name },
        album: this.album
      }
    )

    this.storage.addSchedule(schedule);
    this.router.navigate(['/setup/done'], {state: {schedule}});
  }

}
