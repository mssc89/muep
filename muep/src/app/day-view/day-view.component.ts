import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiResponse } from '../models/response';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
})
export class DayViewComponent implements OnInit {

  system = "";

  godziny = [];
  zajecia = [];

  constructor(private platform: Platform, private api: ApiService) { }

  ngOnInit() {
    this.platform.is("ios") ? this.system = "height-ios" : this.system = "height-android";

    //wypełnij tablicę godzin
    for(let i=7;i<=20;i++){
      this.godziny.push(i+":00")
    }

    this.api
      .getSchedule(1, 106, 1, 1, 10611004)
      .subscribe((data: ApiResponse) => {
        if (data.status == 'ok') {
          let dzien = new Date().toLocaleDateString('pl-PL', { weekday: 'long' });
          this.zajecia = data.message.filter(x => x.day.toLowerCase() == dzien)[0];

          console.log(this.zajecia)

        }
      });
  }

}
